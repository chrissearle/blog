---
title: Illegal type in constant pool
date: 2007-09-03 10:03:42 +0200
tags: [java, tomcat, aspectj, log4j, commons-logging]
---

After adding

CATALINA_OPTS=-javaagent:/path/to/aspectweaver-1.5.3.jar

tomcat started failing - giving an "Illegal type in constant pool" about log4j.

This seems mainly to be due to lib differences.

To get this running on tomcat 5.5.23 I had to:

1. copy the log4j jar from my webapp to the common/lib dir (log4j was not present here before)
1. copy the commons-logging-api jar to the bin directory (replacing the version that was here before).

It seems that aspectjweaving can cause increased sensitivity to classloading/versioning problems.
