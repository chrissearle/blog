---
title: Google address book sync to mac address book - aargh - duplicates
date: 2008-05-28 21:16:14 +0200
tags: [mac, sync, osx, google, gmail, 10.5.3, address book, duplicate]
---

The latest update to Mac OSX 10.5.3 now includes inbuilt google/address book synchronization.

However - after updating and adding my login details for gmail to addressbook it just seemed to hang with:

    Can't connect to the sync server: NSInvalidReceivePortException: connection went invalid while waiting for a reply ((null))

The solution was to remove the contents of ~/Library/Application Support/SyncServices/Local and try again.

Note that for account name it needed the full e-mail address complete with googlemail.com domain.

**Update**

Each and every sync is causing large numbers of duplicate entries - I have 299 cards right now - each sync it goes up to 362 cards. Extremely annoying.
