---
title: Kafka - java to scala - java
date: 2019-04-25 12:14 +0200
tags: [kafka, java, producer, consumer]
series: Kafka - java to scala
updated: 2020-01-23 00:00
intro: Basic producer and consumer in java
---

This series goes through conversion of some basic java kafka clients to scala - step by step. It is important to understand that it is written from my viewpoint - someone who has played with scala, likes it, but has never really had time to get into it.

You will need to have the correct initial setup - see [the introduction](/2019/04/25/kafka-java-to-scala-introduction/)

## Basic Java clients

On the [kafka course](https://www.confluent.io/training/) one of the first things you develop is a basic consumer and producer in java.

## Producer

Let's take a look at the basic producer. There is one main java file here - [BasicProducer.java](https://github.com/chrissearle/kafka-java-to-scala/blob/master/java-starter/producer/src/main/java/net/chrissearle/kafka/BasicProducer.java)

The main method does three main things:

```java
Properties settings = new Properties();

settings.put("client.id", "basic-producer");
settings.put("bootstrap.servers", "localhost:29092");
settings.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
settings.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
```

This sets up the configuration of the kafka producer that we want and says we are working with records that use String both as key and value.

```java
KafkaProducer<String, String> producer = new KafkaProducer<>(settings);
```

This creates the producer with the supplied configuration.

```java
for (int i = 1; i <= 5; i++) {
    final String key = "key-" + i;
    final String value = "value-" + i;

    System.out.println("### Sending " + i + " ###");

    final ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, key, value);
    producer.send(record);
}
```

This posts 5 messages to the topic `hello-world-topic`

### Build and run the producer

This is a standard maven project - simply open in your favourite IDE and build.

The BasicProducer class contains a standard main method - so you should easily be able to run the code from the IDE too. You can also use the maven-exec plugin (see [the readme](https://github.com/chrissearle/kafka-java-to-scala/blob/master/java-starter/producer/README.md)).

The output isn't wildly exciting (we haven't configured logging so ignore related lines):

```
*** Starting Basic Producer ***
### Sending 1 ###
### Sending 2 ###
### Sending 3 ###
### Sending 4 ###
### Sending 5 ###
```

So - let's see if we can see what was added to the topic using a consumer.

## Consumer

There is again one main java file here - [BasicConsumer.java](https://github.com/chrissearle/kafka-java-to-scala/blob/master/java-starter/consumer/src/main/java/net/chrissearle/kafka/BasicConsumer.java)

The main method again does three main things:

```java
Properties settings = new Properties();

settings.put(ConsumerConfig.GROUP_ID_CONFIG, "basic-consumer");
settings.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:29092");
settings.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
settings.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000");
settings.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
settings.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
settings.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
```

This sets up the configuration of the kafka consumer that we want and says we are working with records that use String both as key and value.

```java
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(settings);
```

This creates the consumer with the supplied configuration.

```java
consumer.subscribe(Collections.singletonList("hello-world-topic"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

    for (ConsumerRecord<String, String> record : records) {
        System.out.printf("offset = %d, key = %s, value = %s%n", record.offset(), record.key(),record.value());
    }
}
```

This subscribes to the topic `hello-world-topic` and prints out whatever it finds there.

### Build and run the consumer

This is also a standard maven project - again simply open in your favourite IDE and build then run the main method in BasicConsumer or use [maven directly from the command line](https://github.com/chrissearle/kafka-java-to-scala/blob/master/java-starter/consumer/README.md).

The consumer output now shows the messages that the basic producer sent to the topic:

```
*** Starting Basic Consumer ***
offset = 0, key = key-1, value = value-1
offset = 1, key = key-2, value = value-2
offset = 2, key = key-3, value = value-3
offset = 3, key = key-4, value = value-4
offset = 4, key = key-5, value = value-5
```

Since the consumer listens until interrupted - break out with Ctrl-C.

## Summary

So - we have now a basic consumer and producer in java. Our next step will be a basic scala variant.
