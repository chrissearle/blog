---
title: Mac homebrew and homebrew-alt
date: 2011-03-23 12:42:57 +0100
tags: [mac, osx, rsync, homebrew]
---

**Update 2012-08-23**

Thanks to a comment from Ryan (see comments below) I'm now aware that homebrew itself has a homebrew-dupes repo.

[https://github.com/Homebrew/homebrew-dupes](https://github.com/Homebrew/homebrew-dupes)

From the README:

> Just brew tap homebrew/dupes and then brew install &lt;formula&gt;.

If the formula conflicts with one from mxcl/master or another tap, you can brew install homebrew/dupes/&lt;formula&gt;.

You can also install via URL:

    brew install https://raw.github.com/Homebrew/homebrew-dupes/master/&lt;formula&gt;.rb

**Original post**

Updating [mac homebrew](https://github.com/mxcl/homebrew) from 0.7.1 to 0.8 removed the rsync formula that I use to update mac rsync from the supplied 2.x version to 3.x.

This is due to the fact that homebrew doesn't want duplicates of existing software.

However - these are still available via [homebrew-alt](https://github.com/adamv/homebrew-alt)

For example - to regain the rsync formula was as simple as:

    brew install https://github.com/adamv/homebrew-alt/raw/master/duplicates/rsync.rb
