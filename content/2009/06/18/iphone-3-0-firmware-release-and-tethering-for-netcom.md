---
title: iPhone 3.0 firmware release and tethering for NetCom
date: 2009-06-18 09:47:45 +0200
tags: [iphone, tethering, netcom]
---

I have to say I'm disappointed in NetCom today.

Apple have just released the iPhone 3.0 firmware. This includes both MMS and tethering.

Now - I have very little use for MMS - haven't used it much on previous phones. But tethering is a useful tool when you're stuck away from any wifi and need a brief connection.

Telenor have turned this functionality on by default - but NetCom did not appear to have done so.

**Contact with NetCom support**

I took contact - here's the answer I got:

> Vi har foreløpig valgt å ikke støtte funksjonen for tethering, men vil vurdere behovet etter hva kundene ønsker. Vi anser det som en spennende, men foreløpig marginal tjeneste. NetCom anbefaler egne mobile bredbåndsmodem (for PC og MAC). Disse gir en vel så god kundeopplevelse og kvalitet. 

Translated

> We have decided not to support the functionality of tethering for the time being, but will be evaluating customer demand. We see this as an exciting but for now marginal service. NetCom reccommend their own mobile broadband modem (for PC and MAC). These give a good customer experience and quality.

So - their recommendation is to shell out for yet another subscription.

I'd be less annoyed if it were not for the fact that you can download the tethering config from NetCom themselves for many other phones. I've used it with Nokia n95 and it works flawlessly.

**Hacking it**

It seems that many others are irritated. There are many guides now turning up which go through how to work around this even for non-jailbroken phones.

In fact - simply pointing the iPhone safari browser at [http://help.benm.at/help.php](http://help.benm.at/help.php) and following the prompts will work.

**MMS**

Once the config from benm.at is installed - MMS dies. It seems that the MMS config gets internet.netcom.no as its APN.

The following settings are taken from the manual phone setup guides on netcom.no:

Under Settings > General > Network > Cellular Data Network scroll down to the MMS box

<dl>
<dt>APN</dt>
<dd>mms.netcom.no</dd>
<dt>Username</dt>
<dd>mms</dd>
<dt>Password</dt>
<dd>netcom</dd>
</dl>

The other settings I didn't need to change. MMS will now work again - **BUT** tethering is removed (well - it stays in the options until the next time you try to enable it then it disappears).

**Back to factory defaults - or - what's next?**

At this point I feel like I've done enough testing - and have run a restore. You see - I don't actually want to run a hacked phone. What I do want is for NetCom to allow iPhone users the same functionality that they offer other phones that support tethering. Functionality that Telenor is offering standard.

Come on NetCom - you support this for many other devices - for those of us that don't need a full mobile broadband subscription - just turn it on - after all - it will go against our data usage just like any other transfer - and we have to pay you for that.
