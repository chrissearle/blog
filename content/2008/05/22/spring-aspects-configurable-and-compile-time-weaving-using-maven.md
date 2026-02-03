---
title: Spring, Aspects, @Configurable and Compile Time Weaving using maven
date: 2008-05-22 10:09:16 +0200
tags: [java, spring, maven, '@configurable', aspectj, compile time weaving]
---

Why do most people use Load Time Weaving (LTW)? It requires replacing the javaagent/classloader of your JVM which can lead to all sorts of issues.

Let's take a look at getting Compile Time Weaving (CTW) instead.

This post is using spring 2.5.2, aspectj 1.5.4, java 1.5. (Spring 2.5.4 uses a later version of weaver (3.0 vs. 5.0) - I assume AspectJ 1.6.0 but the aspectj-maven-plugin is also based around 1.5.4 - so for now we'll stick with this combination.)

In spring, we can simply inject resources to normal spring beans, either via the spring context configuration, or by using the support for annotation based injection (@Resource, @Autowired together with @Repository, @Service etc).

However - beans that are of scope="prototype" are harder to handle. They are often new'ed (Bean foo = new FooBean();) either by the developer or by external frameworks (Hibernate for model beans, servlet containers for servlets etc etc).

The [spring framework](http://www.springsource.org/) provides the @Configurable annotation for this.

Any bean that is annotated @Configurable will - by utilising aspects be injected with its properties. So - we need to get things prepared so that this aspect weaving can happen.

Firstly - the spring context.

You will need the following in your application context:

    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       <b>xmlns:context="http://www.springframework.org/schema/context"</b>
       xsi:schemaLocation="http://www.springframework.org/schema/beans&nbsp;http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
           <b>http://www.springframework.org/schema/context&nbsp;http://www.springframework.org/schema/context/spring-context-2.5.xsd</b>">

        <b><context:component-scan base-package="your.package.root"/>
        <context:spring-configured/></b>

        .....

    </beans>

*Remember to add the context namespace to the schema declaration in your context file.*

Now the maven config:

You'll need to use the aspectj-maven-plugin from the codehaus MOJO project.

            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>aspectj-maven-plugin</artifactId>
                <configuration>
                    <complianceLevel>1.5</complianceLevel>
                    <aspectLibraries>
                        <aspectLibrary>
                            <groupId>org.springframework</groupId>
                            <artifactId>spring-aspects</artifactId>
                        </aspectLibrary>
                    </aspectLibraries>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

The jars from the aspectLibraries list should contain pre-compiled aspects (in this case spring's) and these aspects will be compile time woven against your code at compile time.

There is an example available via mercurial

    hg clone https://svn.chrissearle.net/mercurial/examples

Then look in the aspectj/ctw directory.

If you don't have mercurial then you can try browsing to 

    https://svn.chrissearle.net/mercurial/examples/file/tip/aspectj/ctw/

Many thanks to [Kaare Nilsen](http://kaare-nilsen.com/) too - one for the maven plugin we need to use and two for patiently answering daft questions.
