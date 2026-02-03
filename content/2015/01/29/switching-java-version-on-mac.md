---
title: Switching java version on mac
date: 2015-01-29 15:52 +0100
tags: [java, osx, mac]
intro: Handy aliases for switching between java versions.
---

Can't remember where I picked this up - but some handy aliases I use for setting java version (given that you have the required version installed):

```shell
alias j6='export JAVA_HOME=$(/usr/libexec/java_home -v 1.6)'
alias j7='export JAVA_HOME=$(/usr/libexec/java_home -v 1.7)'
alias j8='export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)'
```

This handles picking the right version (1.6 from apple, 1.7 and 1.8 from oracle) etc.
