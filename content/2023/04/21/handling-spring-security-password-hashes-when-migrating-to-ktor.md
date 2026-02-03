---
title: Handling spring-security password hashes when migrating to ktor
date: 2023-04-21 10:13 +0200
tags: [ktor, kotlin, spring, spring security, bcrypt, password]
intro: When moving a spring boot project to ktor - how to handle existing password hashes in the database?
---

Spring boot stores passwords hashed - which is good.

But - when moving to a new framework - how does that play out?

## Spring Password Encoders

Spring boot requires some sort of PasswordEncoder.

If you look at PasswordEncoderFactories.createDelegatingPasswordEncoder() you can see that it can handle lots of different encoders - including out of date ones (so that you can still verify older hashes) - and that the default is bcrypt.

So - how does spring know what sort of hash you have?

This is stored in the database as part of the hash itself.

For example - with defaults - the values in the database look something like:

`{bcrypt}$2a$10$....`

The actual format of the bcrypt part is:

`$2<a/b/x/y>$[cost]$[22 character salt][31 character hash]`

So - here we have $2a with a cost of 10.

## Checking hashes with password4j

In the ktor app - to check the hash you can use any library that can handle bcrypt - for this post - we'll look at [password4j](https://github.com/Password4j/password4j).

```kotlin
Password.check(plaintextPassword, storedHash).withBcrypt()
```

Now - it doesn't know about the prefix - so that has to be stripped off the hash before we check.

So - users will still be able to login after a migration with the same password.

## Updating the hash

However - password4j [recommends](https://github.com/Password4j/password4j/wiki/BCrypt) $2b and cost 12.

How can we update this hash when we don't know the user's password?

We can actually use password4j to provide us the new hash at check time.

### Configuration

Add psw4j.properties to the classpath (src/main/resources)

```ini
global.banner=false
hash.bcrypt.minor=b
hash.bcrypt.rounds=12
```

(this also turns off the banner in the logs)

### Simple user service implementation

This requires some sort of repository that allows you to get the stored hash for a username and to update the hash for a username.

1. Call checkPassword at login with the user supplied username and password.
2. Fetch the current hash from the database (as string)
3. Clean it (remove the `{bcrypt}` prefix)
4. Check that the hash is valid - with `andUpdate()` which gives us a new hash if necessary as well as telling us if it is valid
5. If it is valid and it is updated (changed) - save the hash back to the database
6. Return valid or not

```kotlin
class UserService(private val repository: UserRepository) {

    fun checkPassword(username: String, password: String): Boolean {
        var validPassword = false

        repository.hashForUser(username)?.let { dbPassword ->
            val check = Password.check(password, dbPassword.clean()).andUpdate().withBcrypt()

            if (check.isVerified && check.isUpdated) {
                repository.storeHash(username, check.hash.result)
            }

            validPassword = check.isVerified
        }

        return validPassword
    }

    companion object {
        const val oldPrefix = "{bcrypt}"
    }

    private fun String.clean() = this.replace(oldPrefix, "")

}
```

### Summary

This will allow the user to login with their existing password.

It will also update the user to password4j's recommeded $2b cost 12 setting - and update the database if required.

This update will be invisible to the user too.
