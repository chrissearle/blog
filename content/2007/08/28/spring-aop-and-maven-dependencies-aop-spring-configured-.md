---
title: "Spring AOP and maven dependencies"
date: 2007-08-28 13:31:17 +0200
tags: [java, aop, spring, maven, '@configurable', aspectj]
---

Or - why does it say my spring context xml is invalid on <code><aop:<spring-configured/></code>

I've been trying to add the @Configurable to a spring project.

This means that I had to have a <beans> tag that looks like

    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.0.xsd
                           http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-2.0.xsd
                           http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-2.0.xsd">

(here the important lines are the xmlns:aop and the aop schema location) and the following needs to be in the beans XML

    <aop:spring-configured/>

In addition - I added the spring-aspects dependency in my maven pom

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-aspects</artifactId>
      <version>2.0.6</version>
    </dependency>

Trouble was that the test was throwing an XML error

    org.springframework.beans.factory.xml.XmlBeanDefinitionStoreException: Line 13 in XML document from class path resource [directory.xml] is invalid; nested exception is org.xml.sax.SAXParseException: cvc-complex-type.2.4.c: The matching wildcard is strict, but no declaration can be found for element 'aop:spring-configured'.

A lot of googling suggested that it was using a non-schema compliant XML parser - but I'd made sure that it was using the latest schema supporting xerces.

It turns out that the XSD resolver is trying to find the XSD on the classpath - and it can't find it unless you also have spring-aop

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-aop</artifactId>
      <version>2.0.6</version>
    </dependency>

in your dependency list. I personally feel that this is a confusing error message - but there you go.

All kudos to [Kaare Nilsen](http://kaare-nilsen.com/) for finally spotting what was missing.
