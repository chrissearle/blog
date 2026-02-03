---
title: BankID on Mountain Lion
date: 2013-04-16 21:53:08 +0200
tags: [java, mac, osx, apple, mountain lion, bankid, oracle, applet]
---

Norwegian BankID (used by most banks in Norway) uses a java applet for login.

The current combination of java, mac osx 10.8.x, applets and BankID is a mess.

Things to note:

* Java 1.6 from Apple removed support for web applets - so you'll need Oracle java 7
* Java 7 from Oracle will work - but - not in Chrome (Chrome doesn't support 64 bit java - Oracle don't provide 32 bit)
* Most BankID pages test to see if java is enabled - and after installing java - it *still* gives the java not installed or enabled error. The issue seems to be that you have to activate the plugin by loading an applet that doesn't test for support - for example the one on [http://www.java.com/en/download/testjava.jsp](http://www.java.com/en/download/testjava.jsp) prior to trying to log in to the bank
* BankID state that there is an issue in Firefox where the OK button does not get enabled - you can get around this by holding the CMD key in for a few seconds until it enables. This is claimed to be due to a bug between Firefox and java. Note that in my testing this is exactly the same issue in Safari and the same workaround works.

So - install Oracle java, go visit a test page - log in with a workaround to get OK buttons to enable and you might just be allowed to login to your bank.

The BankID applet needs to die.

Sources:

* [http://support.apple.com/kb/DL1572?viewlocale=en_US](http://support.apple.com/kb/DL1572?viewlocale=en_US)
* [https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2012/Mac-og-Java/](https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2012/Mac-og-Java/)
* [https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2013/Apples-Safari-har-stengt-for-Java/](https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2013/Apples-Safari-har-stengt-for-Java/)
* [https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2013/Mac-brukere-kan-aktivere-Java-pa-javacom/](https://www.bankid.no/Presse-og-nyheter/Nyhetsarkiv/2013/Mac-brukere-kan-aktivere-Java-pa-javacom/)
