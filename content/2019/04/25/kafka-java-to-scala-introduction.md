---
title: Kafka - java to scala - introduction
date: 2019-04-25 12:02 +0200
tags: [kafka, java, scala]
series: Kafka - java to scala
updated: 2020-01-23 00:00
intro: This series will work through converting java from the confluent on-premesis course to scala
---

I was recently a participant on a [Confluent on-premesis kafka course](https://www.confluent.io/training/). While working through the labs (which are in java), for fun I tried the same code in kotlin. That was fun - but I thought it could be a nice exercise to convert from java to scala - step by step - and maybe learn some new scala stuff on the way. It will assume some level of kafka knowledge - what is a producer, consumer, topic etc.

_It is important to understand that it is written from my viewpoint - someone who has played with scala, likes it, but has never really had time to get into it - so this will be somewhat of a discovery journey for me too._

## Posts in this series

1. [A simple java example running](/2019/04/25/kafka-java-to-scala-java/) - a basic producer and consumer pair
1. [Convert java to scala](/2019/04/30/kafka-java-to-scala-scala-v1) - conversion of the basic producer and consumer to scala - on an almost line by line basis
1. [Update the scala version](/2019/05/03/kafka-java-to-scala-scala-v2/) to be more "scala-like" and add a config file instead of hard coded values
1. [A slight digression to look at basic akka-streams](/2019/05/08/kafka-java-to-scala-akka-streams-basics/)
1. [Use akka-streams for the scala example](/2019/05/15/kafka-java-to-scala-akka-streams-kafka/)

## Code

All code is available in this github repository: https://github.com/chrissearle/kafka-java-to-scala

## Docker

All of the related articles assume that you have kafka running using the supplied `docker-compose.yml` file - so in the working directory - run:

    docker-compose up

Make sure you have a good amount of memory available to docker - 4-5 Gb minimum :)
