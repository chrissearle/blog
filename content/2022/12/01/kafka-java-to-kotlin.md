---
title: Kafka - java to kotlin
date: 2022-12-01 13:38 +0100
tags: [kafka, java, scala, kotlin]
intro: Some time back I wrote about converting a simple java kafka project to scala. This is a just for fun look at how similar the kotlin code is.
---

Some time back I wrote about [Kafka - java to scala](/series/kafka-java-to-scala/).

I just wondered how similar the equivalent kotlin code would be.

This is based around the over-simple procducer/consumer example used in that series of posts - but this time embedded in a spring boot setup. However - it ignores all the spring boot kafka support etc - it's just being used to provide simple config loading and logging.

### Producer

In the scala code we built up the config as a Properties instance - in kotlin - a map. Apart from that - pretty similar:

#### Scala

```scala
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
```

#### Kotlin

```kotlin
val producer = KafkaProducer<String, String>(kafkaConfig.configMap())

(1..5).forEach {
        logger.info { "### Sending $it ###" }
        producer.send(ProducerRecord(kafkaConfig.topic, "key-$it", "value-$it"))
}

producer.close()
```

---

### Consumer

In the scala code we again build up the config as a Properties instance - in kotlin - a map. Apart from that - pretty similar. Uses the kotlin.use to provide the try/finally construct.

#### Scala

```scala
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
```

#### Kotlin

```kotlin
KafkaConsumer<String, String>(kafkaConfig.configMap()).use { consumer ->
    consumer.subscribe(listOf(kafkaConfig.topic))

    while (true) {
        val records = consumer.poll(Duration.ofMillis(100))

        records.forEach { record ->
            logger.info { "offset = ${record.offset()}, key = ${record.key()}, value = ${record.value()}" }
        }
    }
}
```

---

### Summary

Are they similar? Yes - extremely. Am I surprised? No :)

This was mostly a "just-for-fun" exercise - and as always - the code is on github:

https://github.com/chrissearle/kafka-java-to-scala
