---
title: Switching between java JDK's on debian
date: 2007-01-15 12:01:17 +0100
tags: [java, debian, alternatives]
---

I use the java-package make-jpkg to install java JVM's. I have mostly used sun's JVM's up to now.

I wanted to easily switch between them (which the alternatives mechanism handles well) but also to keep the relevant JAVA_HOME in sync (for things that still need this in the environment).

The following script I added to my .bashrc

    switch_java () {
        case $1 in
        4 ) JAVA_HOME=/usr/lib/j2sdk1.4-sun ;;
        5 ) JAVA_HOME=/usr/lib/j2sdk1.5-sun ;;
        esac
  
        sudo update-alternatives --set java $JAVA_HOME/bin/java
        sudo update-alternatives --set javac $JAVA_HOME/bin/javac
  
        export JAVA_HOME
    }

So I can now just run

    $ switch_java 4

or

    $ switch_java 5

to change. Note - will require sudo access for the alternatives change.
