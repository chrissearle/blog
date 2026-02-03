---
title: Setting system path for command line on Mac OSX
date: 2014-01-28 08:42 +0100
tags: [mac, osx, homebrew]
---

There's plenty of information out there on how to set up the PATH variable for your local shell for OSX - it uses the same method as people are used to on linux - settings in your shell config files.

But what if you want/need to set the paths at the system level? How is that handled?

Well - to start with - let's take a look in /etc/profile. Here you can see that it's calling /usr/libexec/path_helper.

More information on that can be found on the [path_helper manpage](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man8/path_helper.8.html)

So - paths are being read first from /etc/paths then from any files in /etc/paths.d/

The files in the /etc/paths.d directory will be read in order based on filename.

So - you now have two methods - you can change the default ordering in /etc/paths (and if you wish add paths here) - I use this to move /usr/local/bin before /usr/bin and /bin - since I have my [machomebrew](http://brew.sh/) files there and some of them overwrite the system files (for example a later version of git). Be aware that this means it's up to you not to install files there that are not backwards compatible - your system also uses a lot of files from /usr/bin and /bin :)

And if you want to install a set of paths for a given use/package/app then you can also choose to add that as a file under /etc/paths.d/

Note - you'll need to edit these files as the root user - sudo vi /etc/paths for example - and for that to work you'll either need to be an administrator of the machine or added to the /etc/sudoers file.

And finally - you'll need to start a new shell window before seeing the changes.
