---
title: Functional Error Handling in Ktor with Arrow
date: 2026-05-07 10:18 +0200
tags: [ kotlin, ktor, arrow ]
intro: Using Arrow in Ktor for controlled error handling. Sealed interfaces for error types, Raise for propagation, and extension functions for HTTP responses.
---

I use [Ktor](https://ktor.io/) for a lot of projects - it's lightweight and simple to use. However - when providing any
sort of API I want to make sure that the errors are actually useful and as specific as possible. For that I like to
use [Arrow](https://arrow-kt.io/).

## The Error Model

Everything starts with a sealed interface that represents every error the API can produce:

```kotlin
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable

@Serializable
data class ErrorResponse(
    @Serializable(with = HttpStatusCodeSerializer::class)
    val status: HttpStatusCode,
    val message: String,
    val fieldValue: String? = null,
)

sealed interface ApiError {
    val response: ErrorResponse
}

fun ApiError.status() = response.status

fun ApiError.messageMap(): Map<String, ErrorResponse> =
    when (this) {
        is UpstreamError -> mapOf("upstream" to upstream, "error" to response)
        else -> mapOf("error" to response)
    }
```

`ErrorResponse` is what gets serialized to JSON. `ApiError` is the internal type that routes and services work with — it
never escapes the process boundary. `messageMap()` shapes the JSON body; upstream errors include both the downstream
response and the error we're reporting to our caller.

Because `HttpStatusCode` isn't serializable by default, a custom serializer handles it:

```kotlin
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.descriptors.element
import kotlinx.serialization.encoding.*

object HttpStatusCodeSerializer : KSerializer<HttpStatusCode> {
    override val descriptor =
        buildClassSerialDescriptor("HttpStatusCode") {
            element<Int>("value")
            element<String>("description")
        }

    override fun deserialize(decoder: Decoder): HttpStatusCode =
        decoder.decodeStructure(descriptor) {
            HttpStatusCode.fromValue(decodeIntElement(descriptor, 0))
        }

    override fun serialize(encoder: Encoder, value: HttpStatusCode) =
        encoder.encodeStructure(descriptor) {
            encodeIntElement(descriptor, 0, value.value)
            encodeStringElement(descriptor, 1, value.description)
        }
}
```

### Abstract base classes

Two abstract classes cover the most common error shapes and keep concrete errors concise:

```kotlin
abstract class UpstreamError(
    open val upstream: ErrorResponse,
    val systemName: String,
) : ApiError {
    override val response = ErrorResponse(
        status = HttpStatusCode.InternalServerError,
        message = "call to $systemName failed",
    )
}

abstract class RequiredField(val fieldName: String) : ApiError {
    override val response = ErrorResponse(
        status = HttpStatusCode.BadRequest,
        message = "$fieldName required",
    )
}
```

### Concrete error types

With the base classes in place, project-specific errors are just a few lines each:

```kotlin
// A required field was missing
data object TitleRequired : RequiredField(fieldName = "title")

// A resource wasn't found
data class NoteNotFound(val id: Int) : ApiError {
    override val response = ErrorResponse(
        status = HttpStatusCode.NotFound,
        message = "Note not found: $id",
    )
}

// An ID parameter couldn't be parsed
data class IdMalformed(val value: String) : ApiError {
    override val response = ErrorResponse(
        status = HttpStatusCode.BadRequest,
        message = "ID is not a valid integer: $value",
        fieldValue = value,
    )
}

// An upstream service call failed
data class StorageCallFailed(override val upstream: ErrorResponse) :
    UpstreamError(upstream = upstream, systemName = "Storage Service")

// The version file couldn't be read (covered later)
data class VersionNotReadable(val e: Throwable) : ApiError {
    override val response = ErrorResponse(
        status = HttpStatusCode.InternalServerError,
        message = "${e.message}",
    )
}
```

The sealed interface means the compiler catches any unhandled case in `when` expressions, and adding a new error type
means adding one data class — nothing else needs updating unless you want special `messageMap()` treatment.

## Bridging to HTTP: Respond.kt

The second piece is a set of extension functions that translate `Either<ApiError, A>` directly into Ktor HTTP responses.
Kotlin's context parameters make these feel like they belong on the call:

```kotlin
import arrow.core.Either
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.RoutingContext

context(context: RoutingContext)
suspend inline fun <reified A : Any> Either<ApiError, A>.respond(
    status: HttpStatusCode = HttpStatusCode.OK,
) {
    onLeft { context.respond(it) }
    onRight { context.call.respond(status, it) }
}

context(context: RoutingContext)
suspend fun Either<ApiError, String>.redirect(permanent: Boolean = false) {
    onLeft { context.respond(it) }
    onRight { context.call.respondRedirect(it, permanent) }
}

context(context: RoutingContext)
suspend fun Either<ApiError, String>.respondPlainText(status: HttpStatusCode = HttpStatusCode.OK) {
    onLeft { context.respond(it) }
    onRight { context.call.respondText(status = status, text = it) }
}

suspend fun RoutingContext.respond(error: ApiError) =
    call.respond(error.status(), error.messageMap())
```

There is a discussion here between `onLeft`/`onRight`, vs `ifLeft`/`ifRight`. Both can work - but I have chosen `on*`. The
`if*` variants are for side effects that return `Unit`; the `on*` variants return the original `Either`, which keeps the
type flowing correctly through the chain.

Routes call `.respond()` on the result of an `either { }` block. If the block produces a `Left<ApiError>`, the error is
serialized and sent with the appropriate HTTP status. If it produces a `Right<A>`, the value is serialized with a 200 (
or whatever status was passed). The route handler is left with nothing to do but call `.respond()`.

## Service Layer with Raise

Arrow's `Raise<E>` interface is what makes errors propagate without exceptions. A function that declares
`context(_: Raise<ApiError>)` can call `raise()`, `ensure()`, and `ensureNotNull()` directly, and any error
short-circuits out of the function just like a thrown exception — but typed, not thrown.

Here's a service for the note-taking example:

```kotlin
import arrow.core.raise.Raise
import arrow.core.raise.ensure
import arrow.core.raise.ensureNotNull

class NoteService(private val repository: NoteRepository) {

    context(_: Raise<ApiError>)
    suspend fun getNote(id: Int): Note {
        return ensureNotNull(repository.findById(id)) { NoteNotFound(id) }
    }

    context(_: Raise<ApiError>)
    suspend fun createNote(request: CreateNoteRequest): Note {
        ensure(request.title.isNotBlank()) { TitleRequired }
        return repository.save(Note(title = request.title, body = request.body))
    }

    context(_: Raise<ApiError>)
    suspend fun listNotes(tag: String?): List<Note> {
        val notes = repository.findAll()
        return if (tag != null) {
            ensure(notes.any { tag in it.tags }) { TagNotFound(tag) }
            notes.filter { tag in it.tags }
        } else {
            notes
        }
    }
}
```

`ensureNotNull` unwraps a nullable value or raises the given error. `ensure` raises if the condition is false — it reads
almost like a precondition check. Neither requires a try-catch or a manual `if` branch; they just short-circuit.

### raise() for explicit errors

`raise()` is the explicit form — use it anywhere you want to abort with an error:

```kotlin
context(_: Raise<ApiError>)
suspend fun processNote(id: Int): ProcessedNote {
    val note = repository.findById(id) ?: raise(NoteNotFound(id))
    if (note.archived) raise(NoteArchived(id))
    return process(note)
}
```

It's equivalent to `throw` for this error type, but unlike exceptions the compiler enforces it — you can only call
`raise()` from within a `Raise<ApiError>` context, so the error can't silently escape.

### Wrapping exceptions: catch and withError

External calls — HTTP clients, database drivers, file I/O — throw exceptions. Arrow's `catch` and `withError` let you
absorb those at the boundary and convert them into typed errors.

`catch` runs a block and intercepts any `Throwable`:

```kotlin
import arrow.core.raise.catch

context(_: Raise<ApiError>)
suspend fun fetchRemoteData(url: String): RemoteData {
    return catch({
        httpClient.get(url).body<RemoteData>()
    }) { throwable ->
        raise(StorageCallFailed(ErrorResponse(HttpStatusCode.InternalServerError, throwable.message ?: "unknown")))
    }
}
```

`withError` transforms the error type from one `Raise` context to another. This is useful when you have a function that
raises a specific exception type and you want to map it to your `ApiError`:

```kotlin
import arrow.core.raise.withError

context(_: Raise<ApiError>)
fun readConfig(path: String): Config =
    withError({ e: Throwable -> ConfigReadFailed(e.message ?: "read error") }) {
        catch({
            Config.parse(File(path).readText())
        }) { raise(it) }
    }
```

The two are often combined: `withError` sets the error mapping, and `catch` absorbs the thrown exception and calls
`raise` with it. The exception never propagates; it becomes a typed value.

## Routing: either { }.respond()

With `Raise`-aware services and `Either.respond()` in place, route handlers become very thin:

```kotlin
fun Application.configureNoteRouting(service: NoteService) {
    routing {
        route("/api/notes") {
            get {
                val tag = call.request.queryParameters["tag"]
                either {
                    service.listNotes(tag)
                }.respond()
            }

            get("/{id}") {
                either {
                    val id = NoteId(call.parameters["id"]).bind()
                    service.getNote(id.value)
                }.respond()
            }

            post {
                either {
                    val request = call.receive<CreateNoteRequest>()
                    service.createNote(request)
                }.respond(HttpStatusCode.Created)
            }
        }
    }
}
```

`either { }` converts a `Raise`-based computation into an `Either`. Inside the block, `.bind()` lifts an `Either`
value — if it's a `Left`, the block short-circuits with that error; if it's a `Right`, you get the unwrapped value. This
is how validated domain objects slot in:

```kotlin
data class NoteId(val value: Int) {
    companion object {
        operator fun invoke(raw: String?): Either<ApiError, NoteId> = either {
            val present = ensureNotNull(raw?.takeIf { it.isNotBlank() }) { IdRequired }
            val parsed = present.toIntOrNull() ?: raise(IdMalformed(present))
            NoteId(parsed)
        }
    }
}
```

The `invoke` operator makes `NoteId("42")` return `Either<ApiError, NoteId>`. Inside a route's `either { }` block,
`NoteId(call.parameters["id"]).bind()` either yields a valid `NoteId` or short-circuits the whole handler with the
appropriate error — no try-catch, no manual null check.

You can also use the raise context and avoid the either block which works nicely in some simple cases. For example it's
very common to have a single string parameter expected on a request:

```kotlin
data class Tag(
    val value: String,
) {
    companion object {
        context(_: Raise<ApiError>)
        operator fun invoke(raw: String?): Tag =
            Tag(ensureNotNull(raw?.takeIf { it.isNotBlank() }) { TagNameMissing })
    }
}
```

Usage of `Tag` further in the call stack can then rely on the value being present.

## BuildInfo and the Version Endpoint

Most of my services expose a `/version` endpoint that returns the deployed image tag. The tag is written to a file on
the classpath during CI, and `BuildInfo` reads it at runtime:

```kotlin
import arrow.core.raise.Raise
import arrow.core.raise.catch
import arrow.core.raise.withError

object BuildInfo {
    context(_: Raise<ApiError>)
    fun imageTag(): String =
        withError(::VersionNotReadable) {
            catch({
                BuildInfo::class.java
                    .getResourceAsStream("/image-tag.txt")
                    ?.use { it.readBytes().decodeToString().trim() }
                    ?: "development"
            }) { raise(it) }
        }
}
```

When the file is absent (local development) it falls back to `"development"`. When the file is present but unreadable
for some reason, `VersionNotReadable` propagates as a 500. The GitHub Actions step that writes the file goes before the
build step:

```yaml
- name: Generate build info resource
  run: |
    mkdir -p src/main/resources
    echo "sha-${GITHUB_SHA::7}" > src/main/resources/image-tag.txt
```

The route is one line:

```kotlin
get("/version") {
    either { BuildInfo.imageTag() }.respond()
}
```

## Putting It Together

To illustrate the full flow, here's how a single `GET /api/notes/{id}` request travels through the layers:

1. The route calls `NoteId(call.parameters["id"]).bind()`. If the parameter is missing or non-numeric, an `IdRequired`
   or `IdMalformed` error short-circuits the `either` block immediately.
2. If the ID is valid, `service.getNote(id.value)` is called inside the same `Raise` context. If the repository returns
   null, `ensureNotNull` raises `NoteNotFound`.
3. `either { }` captures whichever path was taken and produces an `Either<ApiError, Note>`.
4. `.respond()` sends either a 404 JSON body or a 200 JSON body. The route handler is finished.

No exceptions propagate. No `when` branches are needed at the call site to figure out which HTTP status to return. Each
error type knows its own status code, and the sealed interface ensures nothing is forgotten.

## Why Bother?

The pattern adds a small amount of overhead — the `ApiError` hierarchy, the `Respond.kt` file, the
`HttpStatusCodeSerializer` — but each of those is written once per project and then mostly forgotten. What you get in
return is:

- **Exhaustive errors** — the compiler tells you when a new error type isn't handled somewhere it needs to be.
- **Clean routes** — handlers are just `either { }.respond()` with business logic in between.
- **No hidden control flow** — there's no question about which exceptions a service method can produce; the
  `Raise<ApiError>` context makes it explicit.
- **Consistent HTTP responses** — every error goes through the same serialization path, so the JSON shape is always
  predictable.
- **Useful errors** - since the raise mechanism short circuits early - you get the error that actually happened, not a
  downstream symptom of it. For example - if an ID is malformed, you get that error instead of a 404 from the database
  driver.


