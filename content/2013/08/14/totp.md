---
title: Time-based One-Time Password (TOTP) authentication for Google and more on iOS7
date: 2013-08-14 13:24 +0200
tags: [TOTP, google authenticator, duo mobile, two-step authentication, ios7, dropbox, google]
---

I use two-step authentication for both my GMail and Google Apps accounts as well as dropbox.

Up to now I've been using Google's iOS authenticator app - but this app has issues in iOS7

1. It **forgets accounts** when you restart the phone
1. You can no longer edit the descriptive name for each account so you have no idea which code is which account
1. Lately it's stopped scanning barcodes too

The first one is of course the most serious.

After some googling I found that there are other TOTP app's out there. I settled on [Duo Mobile](https://itunes.apple.com/us/app/duo-mobile/id422663827?mt=8‎)

After following the [third-party accounts](http://guide.duosecurity.com/third-party-accounts) page I had both my google accounts and my dropbox account in the app and it's working nicely.
