---
title: Using continuum to build maven 2 projects that are in mercurial
date: 2008-05-31 11:27:43 +0200
tags: [maven, mercurial, continuum]
---

Given that the pom has a correctly configured scm tag section then it's just a case of finding the browsable file.

Normally mercurial repo's are exposed using hgweb.cgi or hgwebdir.cgi.

Not sure about hgweb - use hgwebdir myself - but - the trick is to grab the raw file version of the tip revision. Once continuum can grab this then it will use the scm tags to get the project.

    https://server/hgwebdircontext/project/raw-file/tip/pom.xml

**NOTE**

When you run hg clone to grab the repository it will *always* check out the entire repository.

If you have a multi-module project - check out the root pom, set for non-recursive checkout and make sure that you don't set --non-recursive for the maven build. Otherwise you will end up with an identical build set for each child pom (a copy of the parent).
