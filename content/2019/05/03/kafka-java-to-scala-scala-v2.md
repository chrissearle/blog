---
title: Kafka - java to scala - scala v2 - config
date: 2019-05-03 11:33 +0200
tags: [kafka, scala, producer, consumer, pureconfig]
series: Kafka - java to scala
updated: 2020-01-23 00:00
intro: In the previous step we created a basic producer and consumer in scala but it was very close to a line by line conversion. Let's try for something that is closer to normal scala - and let's get the config values out to a configuration file.
---

This series goes through conversion of some basic java kafka clients to scala - step by step. It is important to understand that it is written from my viewpoint - someone who has played with scala, likes it, but has never really had time to get into it.

In the previous step we created a basic producer and consumer in scala but it was very close to a line by line conversion. Let's try for something that is closer to normal scala - and let's get the config values out to a configuration file.

## App boilerplate

First change - instead of having an object with a main method - let's actually state that it's an app.

```scala
object X {
    def main(args: Array[String]): Unit = {
        // Application code
    }
}
```

changes to

```scala
object X extends App {
    // Application code
}
```

## Pure Config

The config values are present in the code - let's do something about that.

For this we'll use the [PureConfig](https://pureconfig.github.io/) library.

### Dependency

We need to add the following to `build.sbt`:

```
  "com.github.pureconfig" %% "pureconfig" % "0.12.0"
```

This is added to the list of libraryDependencies that is already present.

### Configuration file

We can add our configuration values to a file under `src/main/resources` called `application.conf`.

#### Producer

```
client-id = "pureconfig-producer"
bootstrap-servers = "localhost:29092"
topic = "pureconfig-topic"
serializer = "org.apache.kafka.common.serialization.StringSerializer"
```

#### Consumer

```
group-id = "pureconfig-consumer"
bootstrap-servers = "localhost:29092"
topic = "pureconfig-topic"
deserializer = "org.apache.kafka.common.serialization.StringDeserializer"
enable-auto-commit = "true"
auto-commit-interval-ms = "1000"
auto-offset-reset = "earliest"
```

### Loading configuration

PureConfig can load the values into a matching case class.

#### Producer

```scala
case class Config(clientId: String,
                  bootstrapServers: String,
                  topic: String,
                  serializer: String)
```

#### Consumer

```scala
case class Config(groupId: String,
                  bootstrapServers: String,
                  enableAutoCommit: String,
                  autoCommitIntervalMs: String,
                  autoOffsetReset: String,
                  deserializer: String,
                  topic: String
                 )
```

### Loading successful?

We can choose how to handle a config load so that we know if the configuation was loaded OK or not.

One method we can call is `loadOrThrow` which will throw an exception if it can't load the configuration.

```scala
val conf = ConfigSource.default.loadOrThrow[Config]
```

Another option is to just use load - this returns in effect an Either - where the left choice is ConfigReaderFailures and the right choice is configuration matching the case class asked for.

```scala
ConfigSource.default.load[Config] match {
    case Left(errors) => ...
    case Right(config: Config) => ...
}
```

### Config asProperties

There is one thing that means that we can't just use our nice neat Config case classes as is. The kafka clients (KafkaProducer/KafkaConsumer) require a java properties object.

For now - I've simply created an asProperties method onto each Config case class. However - there are other ways of handling this conversion (usually the word `implicit` turns up here - but for this example - let's keep it simple).

## Updated clients

We'll throw in some other small tidying up - this gives the following clients:

### Producer

```scala
import java.time.Duration
import java.util.Properties

import org.apache.kafka.clients.producer.ProducerConfig.{BOOTSTRAP_SERVERS_CONFIG, CLIENT_ID_CONFIG, KEY_SERIALIZER_CLASS_CONFIG, VALUE_SERIALIZER_CLASS_CONFIG}
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerRecord}
import pureconfig.ConfigSource
import pureconfig.generic.auto._

case class Config(clientId: String,
                  bootstrapServers: String,
                  topic: String,
                  serializer: String) {

  def asProperties: Properties = {
    val props = new Properties()

    props.put(CLIENT_ID_CONFIG, clientId)
    props.put(BOOTSTRAP_SERVERS_CONFIG, bootstrapServers)
    props.put(KEY_SERIALIZER_CLASS_CONFIG, serializer)
    props.put(VALUE_SERIALIZER_CLASS_CONFIG, serializer)

    props
  }
}

object ConfigProducer extends App {

  ConfigSource.default.load[Config] match {
    case Left(errors) =>
      println(errors)
      System.exit(1)

    case Right(config: Config) =>
      println("*** Starting Config Producer ***")

      val producer = new KafkaProducer[String, String](config.asProperties)

      (1 to 5).foreach { i =>
        producer.send(new ProducerRecord[String, String](config.topic, s"key-$i", s"value-$i"))
      }

      producer.close(Duration.ofMillis(100))

      println("### Stopping Config Producer ###")
  }
}
```

### Consumer

```scala
import java.time.Duration
import java.util.Properties

import org.apache.kafka.clients.consumer.ConsumerConfig._
import org.apache.kafka.clients.consumer.KafkaConsumer
import pureconfig.ConfigSource
import pureconfig.generic.auto._

import scala.collection.JavaConverters._

case class Config(groupId: String,
                  bootstrapServers: String,
                  enableAutoCommit: String,
                  autoCommitIntervalMs: String,
                  autoOffsetReset: String,
                  deserializer: String,
                  topic: String
                 ) {
  def asProperties: Properties = {
    val props = new Properties()

    props.put(GROUP_ID_CONFIG, groupId)
    props.put(BOOTSTRAP_SERVERS_CONFIG, bootstrapServers)
    props.put(ENABLE_AUTO_COMMIT_CONFIG, enableAutoCommit)
    props.put(AUTO_COMMIT_INTERVAL_MS_CONFIG, autoCommitIntervalMs)
    props.put(AUTO_OFFSET_RESET_CONFIG, autoOffsetReset)
    props.put(KEY_DESERIALIZER_CLASS_CONFIG, deserializer)
    props.put(VALUE_DESERIALIZER_CLASS_CONFIG, deserializer)

    props
  }
}

object ConfigConsumer extends App {
  ConfigSource.default.load[Config] match {
    case Left(errors) =>
      println(errors)
      System.exit(1)

    case Right(config: Config) =>
      println("*** Starting Config Consumer ***")

      val consumer = new KafkaConsumer[String, String](config.asProperties)

      try {
        consumer.subscribe(List(config.topic).asJava)

        while (true) {
          val records = consumer.poll(Duration.ofMillis(100)).asScala

          for (record <- records) {
            println(s"offset = ${record.offset}, key = ${record.key}, value = ${record.value}")
          }
        }
      } finally {
        consumer.close()
      }

  }
}
```

### Build and Run

For each client - we can check it compiles and run it using sbt as before:

```shell
sbt compile
```

sbt's run command will also find classes that extend App so we can also still run:

```shell
sbt run
```

Producer output:

```
*** Starting Config Producer ***
### Stopping Config Producer ###
```

Consumer output:

```
*** Starting Config Consumer ***
offset = 0, key = key-1, value = value-1
offset = 1, key = key-2, value = value-2
offset = 2, key = key-3, value = value-3
offset = 3, key = key-4, value = value-4
offset = 4, key = key-5, value = value-5
```

## Summary

In this step we tidied up the producer and consumer a little and moved our configuration out to a config file.

## Links

- [Producer project](https://github.com/chrissearle/kafka-java-to-scala/tree/master/scala-v2-config/configproducer)
- [Consumer project](https://github.com/chrissearle/kafka-java-to-scala/tree/master/scala-v2-config/configconsumer)
