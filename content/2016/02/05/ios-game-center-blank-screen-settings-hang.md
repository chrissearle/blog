---
title: iOS Game Center blank screen/settings hang
date: 2016-02-05 07:00 +0100
tags: [ios, apple, game center]
intro: Game center hanging on login - how to work around it
---

I occasionally see that games using game center for data sync etc stop being able to log in. If I head to the settings app > game center - it can't open the page for the game center settings.

This was originally a problem in iOS 9.0, thought to be fixed in iOS 9.1 but still being experienced (my last was in iOS 9.2.1).

The trick is to sign out of game center then back in - but how to do so when you can't open the settings?

The solution at the end of [this article on appletoolbox.com](http://appletoolbox.com/2015/10/ios-9-game-center-not-working-blank-page-fix/) worked for me.

To quote the paragraph that helped me:

> Close all running apps on your device. Once you have closed the apps, switch on the airplane mode and then Power off the device. Wait for a few and Power on the device. Go to Settings > Game Center and log out of Game Center. Next, Disable your airplane mode and enable wi-fi. Now that you have the connection up and running, log back into Game Center from Settings > Game Center.
