---
title: P990i SMS via bluetooth
date: 2006-11-04 14:44:29 +0100
tags: [mac, bluetooth, p990i]
---

The changes from [this post](/2006/03/27/bluetooth-modem) about the S700i also work for the P990i (the string is P900).

To collect it in one place - this is taken from [http://www.macosxhints.com/article.php?story=20050731124746116](http://www.macosxhints.com/article.php?story=20050731124746116)

1.  Quit and backup your Address Book app, etc.
1.  Control click on the Address Book app, select Show Package Contents, then navigate to Contents -> Resources.
1.  Control click on Telephony.bundle, select Show Package Contents, then navigate to Contents -> Resources
1.  Open ABDeviceCommandSets.plist with Property List Editor (or a text editor to change the XML in a more primitive way)
1.  Find this array in the ABDeviceCommandSets.plist: Root -> 2 -> ABDeviceModelStrings ... you should see one string entry here: K700. Add another string entry with the value P990.
1.  Save and quit

Note - if you are running with a non-admin account (and if not then why not?) then this will need to be done as an administrator.
