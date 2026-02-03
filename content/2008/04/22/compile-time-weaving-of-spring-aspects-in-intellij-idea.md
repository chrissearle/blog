---
title: Compile Time Weaving of spring aspects in Intellij Idea
date: 2008-04-22 13:41:54 +0200
tags: [java, spring, aspectj, intellij idea]
---

To enable compile time weaving of the spring aspects (spring-aspects.jar) in Intellij IDEA (I am using 7.0.3 - but I assume this to be similar for other versions):


1.  Install and enable the [AspectJ plugin](http://intellij.expertsystems.se/aspectj.html) - it was available in the plugin manager lists by default
1.  Under Settings > AspectJ Weaver, search for aspects - add the spring-aspects jar and enable weaving
1.  In the build menu - make sure AspectJ weaving is enabled

NB: As of plugin 1.0.7 it requires AspectJ 1.5 (I use 1.5.4) - 1.6.0 does not work. This means amongst other things keeping to spring 2.5.2 - spring-aspects 2.5.4 seems to use AspectJ 1.6.0 (at least it complains about weaver version 3.0 vs. 5.0).
