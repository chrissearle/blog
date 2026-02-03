---
title: mitmproxy with java
date: 2020-12-09 08:05 +0100
tags: [java, mitmproxy]
image: /images/posts/2020/12/mitm-curl-response.png
intro: Using mitmproxy to debug java web calls
---

I recently had the need to inspect what a java application was actually sending over the wire including the body content on an https connection.

Let's look at how we can achieve that with [mitmproxy](https://mitmproxy.org/).

mitmproxy runs as an http proxy with both terminal and web inspection interfaces.

Installation is just a case of following the mitmproxy site instructions for your OS - or if you prefer - you can run it inside a [docker image](https://hub.docker.com/r/mitmproxy/mitmproxy)

## Browser proxy

First step is to get mitmproxy up and running.

To start the command line version on port 8899:

```shell
mitmproxy --listen-port 8899
```

The first time it runs it will also create a set of certificates including a CA certificate. We will need these to intercept https traffic and the testing client (web browser or whatever) will have to trust the mitm CA certificate.

Once its running - to test that it works:

```shell
curl --proxy 127.0.0.1:8899 --cacert ~/.mitmproxy/mitmproxy-ca-cert.pem https://www.chrissearle.org
```

In the mitmproxy terminal there should be one flow now shown

![mitmproxy flow from curl](/images/posts/2020/12/mitm-curl-flow.png)

Using the arrow keys (up/down) to select a line - hitting enter drills down.

There are three views (left/right arrow to navigate).

![mitmproxy curl request](/images/posts/2020/12/mitm-curl-request.png)

![mitmproxy curl response](/images/posts/2020/12/mitm-curl-response.png)

![mitmproxy curl details](/images/posts/2020/12/mitm-curl-detail.png)

To get back to the flow list - just hit `q`

So - mitmproxy is working as expected. To use this with a real browser just set it as your browser's proxy (remember that the browser will have to trust the mitmproxy CA certificate - more on that on [mitmproxy docs](https://docs.mitmproxy.org/stable/concepts-certificates/))

## Java

mitmproxy is now working as a browser proxy. Time to try it out in java.

Many java web frameworks can use the system properties http.proxyHost, http.proxyPort, https.proxyHost and https.proxyPort.

But - two of the clients that I use need a little more work to set up a proxy.

## Java HttpClient proxy

First - call get with no proxy:

```java
public class ProxyTest {
  public static void main(String[] args) throws URISyntaxException, IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(new URI("https://www.chrissearle.org"))
        .GET()
        .build();

    HttpClient client = HttpClient.newBuilder().build();

    HttpResponse<String> response =
        client.send(request, HttpResponse.BodyHandlers.ofString());

    System.out.println(response.body());
  }
}
```

Then - modify to use the default proxy (which reads the above system properties):

```java
  public static void main(String[] args) throws URISyntaxException, IOException, InterruptedException {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(new URI("https://www.chrissearle.org"))
        .GET()
        .build();

    HttpClient client = HttpClient.newBuilder().proxy(ProxySelector.getDefault()).build();

    HttpResponse<String> response =
        client.send(request, HttpResponse.BodyHandlers.ofString());

    System.out.println(response.body());
  }
```

However - if you now run this with

```shell
java -Dhttps.proxyHost=localhost -Dhttps.proxyPort=8899 ProxyTest
```

You will find that you get an SSL error - PKIX path building failed

This is because we also need to tell java about the mitmproxy CA certificate.

This is done by adding the certificate to the truststore of the JVM.

The location of this file depends on what OS, what java version, what java installation method etc. In my case - I'm testing with adoptopenjdk 11 under sdkman - so I found the cacerts file under $SDKMAN-DOR/candidates/java/11.0.9.hs-adpt/lib/security

I don't want to modify this in place - so - I copied the cacerts file local to the project.

We then need to import the mitmproxy CA:

```shell
keytool -import -trustcacerts -file ~/.mitmproxy/mitmproxy-ca-cert.pem -alias mitmproxycert -keystore cacerts
```

The default password for keystores is `changeit` - and then when it asks you if you wish to trust the certificate - say yes.

Now we can test again - this time setting the truststore system property:

```shell
java -Dhttps.proxyHost=localhost -Dhttps.proxyPort=8899 -DProxyTest  -Djavax.net.ssl.trustStore=cacerts
```

This time the command should complete and we should now see the call in the mitmproxy flow list

![mitmproxy java httpclient request](/images/posts/2020/12/mitm-java-httpclient-request.png)

## Java Spring WebClient proxy (netty)

A fair number of projects I work on are spring boot based, using the reactive webclient - and the underlying netty library.

For this - we will use a maven project generated at https://start.spring.io/ (java 11/maven/spring boot 2.4.0) with one added dependency - Spring Reactive Web.

This generates a :download{title="pom file" path="/files/posts/2020/12/pom.xml"}

Just to make things simple - we'll make this a command line app and just call the request synchronously in run - first without the proxy:

```java
@SpringBootApplication
public class ProxytestApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(ProxytestApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		WebClient client = WebClient.builder().baseUrl("https://www.chrissearle.org").build();

		String page = client
				.get()
				.retrieve()
				.bodyToMono(String.class)
        .block();

		System.out.println(page);
	}
}
```

Now - let's add the proxy to the client instance. Here the host and port are hard coded but you could set them in application.properties or even read the system properties used above - all depending on what your app needs.

```java
  public void run(String... args) throws Exception {
    HttpClient httpClient = HttpClient.create()
        .tcpConfiguration(tcpClient ->
                tcpClient.proxy(proxy -> {
                  proxy.type(ProxyProvider.Proxy.HTTP).address(new InetSocketAddress("localhost", 8899));
                }));

		ReactorClientHttpConnector connector = new ReactorClientHttpConnector(httpClient);

    WebClient client = WebClient.builder().clientConnector(connector).baseUrl("https://www.chrissearle.org").build();

    String page = client
        .get()
        .retrieve()
        .bodyToMono(String.class)
        .block();

    System.out.println(page);
  }
```

Again - if we run this then we get a PKIX path error - so we need to remember to add the truststore `-Djavax.net.ssl.trustStore=cacerts`

![mitmproxy netty request](/images/posts/2020/12/mitm-netty-request.png)

## Summary

So - mitmproxy can be used to show the decrypted https stream when debugging (if we'd used a post call instead of get then the request part of the mitmproxy output contains this in cleartext).

mitmproxy can do a lot more - modification, replay, and has a bunch of addons - for more info - [the mitmproxy docs](https://docs.mitmproxy.org/stable/)
