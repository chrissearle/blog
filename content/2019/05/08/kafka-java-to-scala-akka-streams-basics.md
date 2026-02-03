---
title: Kafka - java to scala - akka streams basics
date: 2019-05-08 12:41 +0200
tags: [scala, akka, akka streams]
series: Kafka - java to scala
updated: 2020-01-23 00:00
intro: In the previous post we updated our clients to use a configuration library and to make them somewhat more scala-like. Moving forward - we will look at using them together with akka streams but before we can do that - we'll take a very quick trip on akka streams in general.
---

This series goes through conversion of some basic java kafka clients to scala - step by step. It is important to understand that it is written from my viewpoint - someone who has played with scala, likes it, but has never really had time to get into it.

In the [previous post](/2019/05/03/kafka-java-to-scala-scala-v2/) we updated our clients to use a configuration library and to make them somewhat more scala-like.

Moving forward - we will look at using them together with akka streams but before we can do that - we'll take a _very_ quick trip on akka streams in general.

## Brief intro to akka streams

Akka itself has a large amount of information available on the [doc.akka.io](https://doc.akka.io) site. This goes into much more detail and covers a much larger area than this post will - so do give it a read if you want more info.

I also found [this article at scalac.io](https://scalac.io/streams-in-akka-scala-introduction/) to be very informative.

Akka streams allows us to use the akka actor system to handle streaming data.

## Terminology

This is very clearly explained on the article at [scalac.io](https://scalac.io/streams-in-akka-scala-introduction/):

- Source - a source of data - one output
- Flow - a transformation of data - one input, one output
- Sink - a consumer of data - one input.

## Examples

Let's look briefly at two examples (both taken from the [akka streams quickstart guide](https://doc.akka.io/docs/akka/current/stream/stream-quickstart.html))

## Akka stream example 1 - just an int stream

For our source - we'll just use a range of integers. Our source will only use the main output type so we'll mark it as `Int, NotUsed`.

```scala
val source: Source[Int, NotUsed] = Source(1 to 100)
```

Now we need to consume the source - let's just print each int.

```scala
source.runForeach(i => println(i))
```

Lastly - since this source has a finite amount of data - we can get the result of `runForEach` which is of type `Future[Done]` and hook up termination of the Actor system when the stream is completely consumed:

```scala
 done.onComplete(_ => system.terminate())
```

This code does expect a number of things to be implicitly available, the actor system, the materializer, and an execution context.

This gives the following object:

```scala
object IntSeqExample extends App {
    implicit val system = ActorSystem("IntSeqExample")
    implicit val materializer = ActorMaterializer()
    implicit val ec = system.dispatcher

    val source: Source[Int, NotUsed] = Source(1 to 100)

    val done: Future[Done] = source.runForeach(i => println(i))

    done.onComplete(_ => system.terminate())
}
```

However - this code uses some nice shortcut methods that hide some of what is going on. Let's break it down so that we can see the source and the sink here.

```scala
object IntSeqExample2 extends App {
    implicit val system = ActorSystem("IntSeqExample2")
    implicit val materializer = ActorMaterializer()
    implicit val ec = system.dispatcher

    val source: Source[Int, NotUsed] = Source(1 to 100)

    val sink: Sink[Int, Future[Done]] = Sink.foreach[Int](println)

    val done = source.runWith(sink)

    done.onComplete(_ => system.terminate())
}
```

We can add some flows too:

```scala
object IntSeqExample3 extends App {
  implicit val system = ActorSystem("IntSeqExample2")
  implicit val materializer = ActorMaterializer()

  val evenFlow: Flow[Int, Int, NotUsed] = Flow[Int].filter(i => i % 2 == 0)
  val toStringFlow: Flow[Int, String, NotUsed] = Flow[Int].map(i => i.toString)

  val source: Source[Int, NotUsed] = Source(1 to 100)
  val evenSource: Source[Int, NotUsed] = source.via(evenFlow)
  val evenStringSource: Source[String, NotUsed] = evenSource.via(toStringFlow)

  val sink: Sink[String, Future[Done]] = Sink.foreach[String](println)

  val done = evenStringSource.runWith(sink)

  implicit val ec = system.dispatcher
  done.onComplete(_ => system.terminate())
}
```

## Akka stream example 2 - factorials

This example starts with the exact same source (integer range).

It then operates over the stream - calculating an accumulated value:

```scala
val factorials = source.scan(BigInt(1))((acc, next) => acc * next)
```

And then - we can consume it by zipping it together with a second source - to provide the list of factorials:

```scala
factorials
      .zipWith(Source(0 to 100))((num, idx) => s"$idx! = $num")
      .runForeach(println)
```

This gives the following object:

```scala
object FactorialExample extends App {
    implicit val system = ActorSystem("FactorialExample")
    implicit val materializer = ActorMaterializer()
    implicit val ec = system.dispatcher

    val source: Source[Int, NotUsed] = Source(1 to 100)

    val factorials = source.scan(BigInt(1))((acc, next) => acc * next)

    val done: Future[Done] = factorials
      .zipWith(Source(0 to 100))((num, idx) => s"$idx! = $num")
      .runForeach(println)

    done.onComplete(_ => system.terminate())
}
```

## Compile and run

Start the sbt console, clean, compile and run each client:

```shell
$ sbt
> clean
> compile
> runMain example.IntSeqExample
> runMain example.IntSeqExample2
> runMain example.IntSeqExample3
> runMain example.FactorialExample
```

### Output

#### Integer sequence

```shell
1
2
3
...
98
99
100
```

#### Integer sequence 2

```shell
1
2
3
...
98
99
100
```

#### Integer sequence 3

```shell
2
4
...
98
100
```

#### Factorial

```shell
0! = 1
1! = 1
2! = 2
...
98! = 9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000
99! = 933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000
100! = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
```

## Summary

This was an extremely brief look at akka-streams - taken mostly from the [akka streams quick start guide](https://doc.akka.io/docs/akka/current/stream/stream-quickstart.html) and from [scalac.io](https://scalac.io/streams-in-akka-scala-introduction/).

Our next step will be to use akka streams for our producer and consumer clients.

## Links

- [Streams project](https://github.com/chrissearle/kafka-java-to-scala/tree/master/akka-streams-basics)
