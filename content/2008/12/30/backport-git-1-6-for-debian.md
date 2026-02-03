---
title: Backport git 1.6 for debian
date: 2008-12-30 00:13:10 +0100
tags: [debian, debian experimental, git, git 1.6, git-core, git-core-1.6]
---

git 1.6 is available in debian experimental. I want to use it under debian stable (etch).

Let's backport it.

Kudos to [Steve Kemp](http://www.steve.org.uk/) for walking me through this.

First you need dget installed:

    aptitude install devscripts

Now - let's grab the experimental source and unpack it:

    dget http://ftp.de.debian.org/debian/pool/main/g/git-core/git-core_1.6.0.6-1.dsc dpkg-source -x *.dsc

Let's take a look - change into the directory:

    cd git-core_1.6.0.6

We need to make a couple of small changes.

###Edit debian/changelog

On the top line I changed experimental to stable and added -chris-1 to the version (I do not want my deb to cause issues when updates to debian mean that I'm going to get a real 1.6 git deb).

###Edit debian/control

Look for the Build-depends line. Remove the versions from asciidoc and docbook-xsl - and change tcl from 8.5 to 8.4 - I ended up with:

    Build-Depends: libz-dev, libcurl4-gnutls-dev | libcurl3-gnutls-dev, asciidoc, xmlto, docbook-xsl,
    libexpat1-dev, subversion, libsvn-perl | libsvn-core-perl, unzip, tcl8.4, gettext, cvs, cvsps,
    libdbd-sqlite3-perl

Now let's build

    debuild -sa

It will complain about missing .orig files in the parent dir (since we changed the version numbers). Say yes to continue.  It will complain about missing deps (unless you have them all) I had to run:

    sudo aptitude install libcurl3-gnutls-dev asciidoc xmlto docbook-xsl libexpat1-dev libsvn-perl cvsps libdbd-sqlite3-perl

Build again

    debuild -sa

It will complain about missing .orig files in the parent dir (since we changed the version numbers). Say yes to continue. The build starts. And it runs tests. Lots and lots and lots of tests (good eh?).

At the end I got some signing errors - I don't have a key matching the e-mail address in the changelog file. The deb's are already created at this point.

###Issues

*  git-daemon-run requires a later version of runit - I haven't looked at this as I don't use git-daemon-run
*  None of the gui apps work as I don't have the correct tk installed (this is a server - I don't need the gui apps - so I haven't looked at this either)

