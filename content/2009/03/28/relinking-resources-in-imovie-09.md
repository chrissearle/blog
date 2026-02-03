---
title: Relinking resources in iMovie 09
date: 2009-03-28 12:18:21 +0100
tags: [imovie, imovie09]
---

During a disk tidy I moved a whole load of iMovie Events from one disk to another (from within iMovie). This worked fine.

However - I had some external media (mp3 file, couple of stills) which I'd just dragged in from the Downloads folder - and having moved these I found that iMovie no longer could find them (yellow warning triangle on the audio media and black video where the stills were used).

To reattach these takes a little fiddling.

The information is in the imovie project file in the file called Project. This is a binary plist file.

Make sure that iMovie isn't running and you'll probably want to backup the Project file.

So at the command line I did:

```shell
cd Movies/iMovie Projects.localized/&lt;ProjectName&gt;.rcproject
plutil -convert xml1 Project
```

Project is now an xml plist and you can edit it. I opened it in textmate and then searched for the old path (in my case Downloads) and then replaced with the new one (it didn't like spaces in the path - but - instead of trying different escape syntaxes etc I just used a path with no spaces). I expect you can edit it with the standard plist editor too - but I didn't try.

Then once complete:

```shell
cd Movies/iMovie Projects.localized/&lt;ProjectName&gt;.rcproject
plutil -convert binary1 Project
```

This should now allow iMovie when next opened to find the missing resources. At least it did for me.
