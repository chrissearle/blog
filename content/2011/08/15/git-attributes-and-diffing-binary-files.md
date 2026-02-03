---
title: Git attributes and diffing binary files
date: 2011-08-15 08:47:49 +0200
---

Came across this on [Pro Git 7.2 Customizing Git Git Attributes](http://progit.org/book/ch7-2.html)

You can use git attributes to allow for customized diff of binary files.

My current additions to my global git config are

    git config --global diff.strings.textconv strings
    git config --global diff.exif.textconv exiftool

Then in projects (either .gitattributes or .git/info/attributes depending on whether you want it checked in or not):

    *.<ext> diff = <diffname>

For example

    *.png diff = exif
    *.jpg diff = exif
    *.doc diff = strings
