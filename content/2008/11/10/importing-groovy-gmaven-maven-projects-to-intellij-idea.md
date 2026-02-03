---
title: Importing Groovy/GMaven/maven projects to Intellij IDEA
date: 2008-11-10 21:21:16 +0100
tags: [java, maven, groovy, gmaven, intellij, idea]
---

When importing a maven pom that uses the gmaven plugins - remember to go into project structure settings and set src/main/groovy as sources and src/test/groovy as test sources.

I'd also like to know why on import of a project that has had mvn install run on it causes Idea to have issues about generated source mismatch etc - mvn clean then a rebuild in Idea will fix this but I can't pin down what is not right.
