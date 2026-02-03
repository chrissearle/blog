---
title: r2dbc-postgresql - invalid ipv6 address when dockerized
date: 2022-02-22 10:50 +0100
tags: [docker, kotlin, spring, spring boot, postgresql, r2dbc, ipv6]
intro: A spring boot app using r2dbc was working fine locally but failing under docker - with "invalid ipv6 address"
---

I was testing out R2DBC inside spring boot with kotlin's coroutines - and it was working fine while I was developing it.

The develop setup was simple - a docker container for the actual postgres database - exposing the standard port 5432 on localhost - and then just run the kotlin boot app.

However - once I wanted to add this to staging - the setup changes - the following were set up in docker:

- docker network for the app (bridge driver)
- postgres container
- app container

And suddenly - although flyway could talk to the database via jdbc - the r2dbc connection was failing.

The connection string looked like this:

```text
r2dbc:pool:postgresql://${DB_HOST}:${DB_PORT}/db_name
```

So - I had to create a test harness to see what was going on.

[Repository on GitHub](https://github.com/chrissearle/r2dbc-pg-test)

First up - you need to build the application:

```shell
mvn clean package
```

## Development

Now - let's try running it as if we were in development:

We'll start up a local db container for testing (with some options to make sure it's a clean instance)

```shell
docker-compose -f docker-compose-test-1.yml up --force-recreate -V
```

And then run the appliation

```shell
DB_HOST=localhost DB_PORT=5432 DB_USER=test DB_PASSWORD=test java -jar target/test-pg-r2dbc.jar
```

The application runs and you should get something like this at the end of the logs:

```log
YYYY-MM-DD HH:MM:SS.SSS  INFO THREADID --- [           main] n.c.testpgr2dbc.TestPgR2dbcApplication   : Sample(id=1, name=Name)
YYYY-MM-DD HH:MM:SS.SSS  INFO THREADID --- [tor-tcp-epoll-1] n.c.testpgr2dbc.TestPgR2dbcApplication   : Sample(id=1, name=Name)
```

## Staging/Production

So let's mimic a staging setup.

First - we need to package the app into docker:

```shell
docker build -t test-pg-r2dbc:latest .
```

Now we can run up the more complex docker setup:

```shell
docker-compose -f docker-compose-test-2.yml up --force-recreate -V
```

This time the logs show postgresql starting then the app - which then errors:

```text
Cannot connect to app_db:5432/<unresolved>:5432
```

and deeper in the stacktrace:

```text
Caused by: java.net.UnknownHostException: app_db:5432: invalid IPv6 address
```

Very strange.

## Prefer IPv4?

Some googling suggested that they have had issues with IPv6 in r2dbc-postgresql before - and they suggest setting the following JVM param:

```shell
-Djava.net.preferIPv4Stack=true
```

However - the results were exactly the same.

## Workaround

What does seem to work however - is removing the port from the r2dbc URL.

In application.yml - change:

```yml
spring:
  r2dbc:
    url: r2dbc:pool:postgresql://${DB_HOST}:${DB_PORT}/test_db
```

to

```yml
spring:
  r2dbc:
    url: r2dbc:pool:postgresql://${DB_HOST}/test_db
```

Now - we just need to rebuild:

```shell
mvn package
docker build -t test-pg-r2dbc:latest .
```

And run again:

```shell
docker-compose -f docker-compose-test-2.yml up --force-recreate -V
```

And this time - it works:

```log
app       | YYYY-MM-DD HH:MM:SS.SSS  INFO 1 --- [           main] n.c.testpgr2dbc.TestPgR2dbcApplication   : Sample(id=1, name=Name)
app       | YYYY-MM-DD HH:MM:SS.SSS  INFO 1 --- [tor-tcp-epoll-1] n.c.testpgr2dbc.TestPgR2dbcApplication   : Sample(id=1, name=Name)
```

This does feel like a bug in r2dbc-postgresql - but I'm not entirely sure - this was written trying to work out how r2dbc works - so I am not sure if it is completely correct - but - at least it now works.

Is it an issue having to use the default port?

Not really - since I run each application under docker on its own docker network and with a container for each postgres DB (or other DB) so there should be no conflicts.
