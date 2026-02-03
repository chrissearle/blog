---
title: Using maven2 scm and release plugins with mercurial/hg
date: 2008-05-27 11:27:10 +0200
tags: [maven, release-plugin, scm-plugin, mercurial, hg]
---

Mercurial - like some other distributed version control systems works such that each developer has a full value repository - there is no real *master* other than by convention in a team.

To set up your maven project so that the scm configuration points to a developers local repo:

    <scm>
        <connection>scm:hg:file://${basedir}</connection>
        <developerConnection>scm:hg:file://${basedir}</developerConnection>
    </scm>

Note that you do not need configuration for the release plugin (svn users would normally configure URL to the tag path here for example).

However, this will cause issues in other areas. For example - what will happen when you add your pom to a CI (continuum/hudson etc) and it tries to check out? It won't find the repository.

**Shared/remote repo**

Just point the scm tag to the repo scm:hg:http://repo.

More info:

*  [Maven SCM Home](http://maven.apache.org/scm/)
*  [Maven Release Plugin](http://maven.apache.org/plugins/maven-release-plugin/)
*  [Mercurial Wiki](http://mercurial.selenic.com/wiki/)

