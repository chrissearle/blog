---
title: Running rvm ruby 1.9.2 with rvm packages on OSX Lion - failing to make due to readline
date: 2011-08-16 10:05:44 +0200
tags: [mac, ruby, osx, rvm, lion, readline]
---

Getting rvm rubies to compile with the rvm packages isn't turning out that easy.

First off - you need to get XCode for Lion installed from the App Store (even if you upgraded from Snow Leopard - Lion needs a newer version). In addition - the App Store downloads an XCode installer - you also have to run it to get it installed ;)

So I grabbed the latest rvm:

```shell
bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)
```

This puts up the following message:

```
    Notes for Darwin ( Mac OS X )
        For Lion, Rubies should be built using gcc rather than llvm-gcc. Since
        /usr/bin/gcc is now linked to /usr/bin/llvm-gcc-4.2, add the following to
        your shell's start-up file: export CC=gcc-4.2
        (The situation with LLVM and Ruby may improve. This is as of 07-23-2011.)
```

I've also read online that it may help with setting ARCHFLAGS - have tested the following with and without this setting - getting the same error.

So - OK:

```shell
export ARCHFLAGS="-arch x86_64"
export CC=gcc-4.2
rvm pkg install readline
rvm pkg install iconv
rvm pkg install zlib
rvm install 1.9.2 -C --with-readline-dir=$rvm_path/usr --with-iconv-dir=$rvm_path/us --with-zlib-dir=$rvm_path/usr
```

It gets as far as compiling ruby. Then it throws an error:

```
    ruby-1.9.2-p290 - #configuring
    ruby-1.9.2-p290 - #compiling
    ERROR: Error running 'make ', please read /Users/chris/.rvm/log/ruby-1.9.2-p290/make.log
```

And the make error is:

```
    readline.c: In function ‘username_completion_proc_call’:
    readline.c:1386: error: ‘username_completion_function’ undeclared (first use in this function)
```

Googling is showing people with the same issue - but the only fixes I've seen so far are the ARCHFLAGS and CC exports - and they're not helping :(

The issue seems to be very related to readline.

Will update if I find out about this - but if you have a suggestion - please comment with it.
