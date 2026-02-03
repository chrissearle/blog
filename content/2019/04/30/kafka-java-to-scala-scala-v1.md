---
title: Kafka - java to scala - scala v1 - basic
date: 2019-04-30 12:08 +0200
tags: [kafka, scala, producer, consumer]
series: Kafka - java to scala
updated: 2020-01-23 00:00
intro: In the previous step we created a basic producer and consumer in java. Let's try for a direct conversion (almost line by line) to scala as a first step.
---

This series goes through conversion of some basic java kafka clients to scala - step by step. It is important to understand that it is written from my viewpoint - someone who has played with scala, likes it, but has never really had time to get into it.

In the previous step we created a basic producer and consumer in java. Let's try for a direct conversion (almost line by line) to scala as a first step.

## Producer

### Project Structure

Scala uses sbt as its build tool.

First we create the project structure. We'll use the sbt function that uses a giter8 template to create the project.

`sbt new scala/scala-seed.g8 --name=BasicProducer`

This will download a bunch of stuff then create a structure in ./basicproducer.

#### build.sbt

Now - let's get `build.sbt` updated. We need to customize the file so that it works for us.

Firstly - at the time of writing the latest scala was 2.13 - but some dependencies in kafka we'll be using are expecting a 2.12.x - so we'll set the scalaVersion.

I've also updated the organization and dumped the organizationName params.

Finally - we'll drop the Dependencies object (we can delete the file `project/Dependencies.scala`) - we have such a simple project we don't need a complex dependency setup.

This gives be the following file:

```scala
ThisBuild / scalaVersion     := "2.12.10"
ThisBuild / version          := "0.1.0-SNAPSHOT"
ThisBuild / organization     := "net.chrissearle"

lazy val root = (project in file("."))
  .settings(
    name := "BasicProducer",
    libraryDependencies ++= Seq(
      "org.apache.kafka" % "kafka-clients" % "2.3.0"
    )
  )

```

#### project/build.properties

We configure which sbt version we want in the file `project/build.properties`.

The generated version is fine:

```
sbt.version=1.3.2
```

### Project Code

The template created the directory structure we want under src/main. Let's remove the src/main/scala/example/Hello.scala file - we don't need that. For now we'll also remove the src/test directory - naughty I know - but there are plenty of other scala testing tutorials out there.

#### Scala producer

Now for the actual scala code.

We'll create BasicProducer.scala in the src/main/scala directory.

```scala
import java.time.Duration
import java.util.Properties

import org.apache.kafka.clients.producer.ProducerConfig.{BOOTSTRAP_SERVERS_CONFIG, CLIENT_ID_CONFIG, KEY_SERIALIZER_CLASS_CONFIG, VALUE_SERIALIZER_CLASS_CONFIG}
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerRecord}
import org.apache.kafka.common.serialization.StringSerializer

object BasicProducer {

  def main(args: Array[String]): Unit = {

    println("*** Starting Basic Producer ***")

    val settings = new Properties()

    settings.put(CLIENT_ID_CONFIG, "basic-producer")
    settings.put(BOOTSTRAP_SERVERS_CONFIG, "localhost:29092")
    settings.put(KEY_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer].getCanonicalName)
    settings.put(VALUE_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer].getCanonicalName)

    val producer = new KafkaProducer[String, String](settings)

    val topic = "scala-v1-basic-topic"

    for (i <- 1 to 5) {
      val key = "key-" + i
      val value = "value-" + i

      println(s"### Sending ${i} ###")

      producer.send(new ProducerRecord[String, String](topic, key, value))
    }

    producer.close(Duration.ofMillis(100))

    println("### Stopping Basic Producer ###")

  }
}
```

If you compare this to the java version - this is almost line for line the same code.

Let's make sure it compiles:

```shell
sbt compile
```

And then - let's run it. sbt's run will just run the first main method it finds.

```shell
sbt run
```

The output here is almost the same as for the java example (we still haven't configured logging so ignore related lines):

```
*** Starting Basic Producer ***
### Sending 1 ###
### Sending 2 ###
### Sending 3 ###
### Sending 4 ###
### Sending 5 ###
### Stopping Basic Producer ###
```

## Consumer

### Project Structure

We will use almost the same project structure for the consumer as for the producer.

#### build.sbt

The only difference in build.sbt is the name:

```scala
name := "BasicConsumer"
```

#### project

`project/build.properties` is the same as for producer.

### Project Code

#### Scala consumer

We'll create BasicConsumer.scala in the src/main/scala directory.

```scala
import java.time.Duration
import java.util.Properties

import org.apache.kafka.clients.consumer.ConsumerConfig._
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.StringDeserializer

import collection.JavaConverters._

object BasicConsumer {

  def main(args: Array[String]): Unit = {

    println("*** Starting Basic Consumer ***")

    val settings = new Properties()

    settings.put(GROUP_ID_CONFIG, "basic-consumer")
    settings.put(BOOTSTRAP_SERVERS_CONFIG, "localhost:29092")
    settings.put(ENABLE_AUTO_COMMIT_CONFIG, "true")
    settings.put(AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000")
    settings.put(AUTO_OFFSET_RESET_CONFIG, "earliest")
    settings.put(KEY_DESERIALIZER_CLASS_CONFIG, classOf[StringDeserializer])
    settings.put(VALUE_DESERIALIZER_CLASS_CONFIG, classOf[StringDeserializer])

    val consumer = new KafkaConsumer[String, String](settings)

    val topic = "scala-v1-basic-topic"

    try {
      consumer.subscribe(List(topic).asJava)

      while (true) {
        val records = consumer.poll(Duration.ofMillis(100))

        for (record <- records.asScala) {
          println(s"offset = ${record.offset}, key = ${record.key}, value = ${record.value}")
        }
      }
    } finally {
      consumer.close()
    }
  }
}
```

If you compare this to the java version - this is again doing the same thing as the java consumer code.

Let's make sure it compiles:

```shell
sbt compile
```

And then run:

```shell
sbt run
```

The output is the same as for the java example

```
*** Starting Basic Consumer ***
offset = 0, key = key-1, value = value-1
offset = 1, key = key-2, value = value-2
offset = 2, key = key-3, value = value-3
offset = 3, key = key-4, value = value-4
offset = 4, key = key-5, value = value-5
```

## Summary

In this step we converted the producer and consumer to scala.

So far all that has done is to make this a little harder for java coders to understand :)

But moving forward we'll look at improving the code, better scala, akka, streams etc etc.

## Links

- [Producer project](https://github.com/chrissearle/kafka-java-to-scala/tree/master/scala-v1-basic/basicproducer)
- [Consumer project](https://github.com/chrissearle/kafka-java-to-scala/tree/master/scala-v1-basic/basicconsumer)
