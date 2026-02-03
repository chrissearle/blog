---
title: fink selfupdate fails due to cc1plus update
date: 2007-03-07 08:45:00 +0100
tags: [mac, fink, lwp, head]
---

[fink](http://fink.sf.net) update was failing with the following error about head missing a -n option:

    cc1plus: warning: "-Wbad-function-cast" is valid for C/ObjC but not for 
     C++
     cursesfile=`echo "#include <curses.h>" | \
           gcc-3.3 -E - | grep "curses.h" | head -n 1 | \
           sed -e "s/^[^"]*"//; s/".*$//"`; \
     if [ "$cursesfile" = "" ]; then echo "can"t find curses file"; exit 1; 
     fi; \
     perl /sw/src/dpkg-1.10.21-215/dpkg-1.10.21/dselect/mkcurkeys.pl 
     keyoverride $cursesfile > curkeys.h
     Unknown option: n
     Usage: head [-options] <url>...
      -m <method>   use method for the request (default is "HEAD")
      -f            make request even if head believes method is illegal
      -b <base>     Use the specified URL as base
      -t <timeout>  Set timeout value
      -i <time>     Set the If-Modified-Since header on the request
      -c <conttype> use this content-type for POST, PUT, CHECKIN
      -a            Use text mode for content I/O
      -p <proxyurl> use this as a proxy
      -P            don"t load proxy settings from environment
      -H <header>   send this HTTP header (you can specify several)
 
      -u            Display method and URL before any response
      -U            Display request headers (implies -u)
      -s            Display response status code
      -S            Display response status chain
      -e            Display response headers
      -d            Do not display content
      -o <format>   Process HTML content in various ways
 
      -v            Show program version
      -h            Print this message
 
      -x            Extra debugging output
     can"t find curses file

It turns out that the issue is that when you install perl LWP it installs HEAD, GET and POST into /usr/bin. Mac OSX uses HFS+ which is case insensitive - this then overwrites the normal head utility.

I moved the HEAD/GET/POST utilities to /usr/local/bin and grabbed the head utility from a different mac box - this solved the problem.
