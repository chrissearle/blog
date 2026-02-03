---
title: Ktor 2 route withRole for JWT
date: 2023-04-18 22:49 +0200
tags: [ktor, jwt, kotlin, route]
intro: Adding support for withRole() {} to routing in ktor2
---

In ktor 2 - authenticating with JWT is fairly simple.

In my case - the user will get a token with two claims that are of interest.

- username - unsurprisingly the logged in user's username
- roles - an array of role names

For this application the roles are very simply defined:

```kotlin
enum class Role {
    USER, ADMIN
}
```

For the token it is a simple string representation.

However - while it is easy to mark routing blocks as requiring authentication:

```kotlin
authenticate {
    get("/foo") {
        call.respond(HttpStatusCode.OK, service.getFoo()
    }

    route("/admin") {
        get("/bar") {
            call.respond(HttpStatusCode.OK, service.getFoo()
        }
    }
}
```

I wanted some nice clean way to be able to require a role for different routes. I only need the ability to specify a single role, and can rely on the fact that we are only working with a JWTPrincipal here.

Something like this:

```kotlin
authenticate {
    withRole(Role.USER) {
        get("/foo") {
            call.respond(HttpStatusCode.OK, service.getFoo()
        }
    }

    withRole(Role.ADMIN) {
        route("/admin") {
            get("/bar") {
                call.respond(HttpStatusCode.OK, service.getFoo()
            }
        }
    }
}
```

So - implementing this using createRouteScopedPlugin

First - the configuration:

```kotlin
class AuthConfig {
    lateinit var role: Role
}
```

Then - use that in the plugin:

```kotlin
class AuthorizationException(override val message: String? = null) : Throwable()

class AuthenticationException(override val message: String? = null) : Throwable()

val RoleBasedAuthentication = createRouteScopedPlugin(
    name = "AuthorizationPlugin",
    createConfiguration = ::AuthConfig,
) {
    val requiredRole = pluginConfig.role

    on(AuthenticationChecked) { call ->
        val user = call.principal<JWTPrincipal>() ?: throw AuthenticationException(message = "Unauthenticated User")

        val userRoles = user.getListClaim("roles", Role::class) ?: emptyList()
        val username = user.get("username")

        if (!userRoles.contains(requiredRole)) {
            throw AuthorizationException(message = "User [$username] does not have required role [$requiredRole]: user: $userRoles")
        }
    }
}
```

Don't forget to handle AuthenticationException and AuthorizationException in statusPages - I log the message and return some vague 4xx error to the user :)

Finally - add some extensions on Route to make it easy to use:

```kotlin
class AuthorizedRouteSelector(private val desc: String) : RouteSelector() {
    override fun evaluate(context: RoutingResolveContext, segmentIndex: Int): RouteSelectorEvaluation =
        RouteSelectorEvaluation.Constant

    override fun toString(): String = "Authorize: $desc"
}

fun Route.withRole(role: Role, build: Route.() -> Unit) =
    authorizedRoute(requiredRole = role, build = build)

private fun Route.authorizedRoute(
    requiredRole: Role,
    build: Route.() -> Unit,
): Route {
    val authorizedRoute = createChild(AuthorizedRouteSelector(requiredRole.toString()))

    authorizedRoute.install(RoleBasedAuthentication) {
        role = requiredRole
    }

    authorizedRoute.build()

    return authorizedRoute
}
```

At this point - the route block above using withRole() {} should now be working :)
