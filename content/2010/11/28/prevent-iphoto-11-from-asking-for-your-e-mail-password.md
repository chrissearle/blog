---
title: Prevent iPhoto '11 from asking for your e-mail password
date: 2010-11-28 19:46:06 +0100
tags: [mac, smtp, osx, mail, passwords, iphoto, iphoto 11, keychain access, ilife 11]
image: /images/posts/2010/11/password-access.png
---

iPhoto '11 from iLife '11 has a new set of e-mail templates for sending photos directly from the application.

However - each time it prompts for your e-mail password and doesn't seem to have a "remember" option.

To fix - open Keychain Access (/Applications/Utilities).

Select login (your login keychain) from the top left Keychains list and Passwords from the lower left (Category) list.

In the list of passwords - scroll down until you find the sending account password (for example - gmail users would likely have an imap.gmail.com for retrieval and an smtp.gmail.com for sending).

Double click it to bring up the properties dialog.

It defaults to showing the Attributes pane - select Access Control at the top.

Add iPhoto to the list of applications (the + symbol):

![Screenshot](/images/posts/2010/11/password-access.png)

Save changes and you're done.
