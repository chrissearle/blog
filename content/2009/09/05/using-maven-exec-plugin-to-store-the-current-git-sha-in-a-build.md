---
title: Using maven-exec-plugin to store the current git sha in a build
date: 2009-09-05 11:52:27 +0200
tags: [maven, git, buildnumber-maven-plugin, exec-maven-plugin]
---

The current version of the maven buildnumber plugin does not yet support the git scm backend. This makes it harder to get the git sha for the current build (often a snapshot build) into the MANIFEST.MF file.

However - if all you need is a file somewhere in the deployed artifact that contains the sha then this workaround may help until the git scm is supported by buildnumber:

```xml
    <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>exec-maven-plugin</artifactId>
        <version>1.1</version>
        <executions>
            <execution>
                <phase>compile</phase>
                <goals>
                    <goal>exec</goal>
                </goals>
            </execution>
        </executions>
        <configuration>
            <executable>git</executable>
            <arguments>
                <argument>log</argument>
                <argument>--pretty=format:%H</argument>
                <argument>-n1</argument>
            </arguments>
            <outputFile>target/classes/gitsha.txt</outputFile>
        </configuration>
    </plugin>
```

This will put a file in the artifact containing the sha. You will need git in your path for this to work.
