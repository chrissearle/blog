---
title: iMessage fall back to SMS
date: 2012-10-11 18:49:55 +0200
tags: [ios, imessage, sms]
---

iMessage has a setting whereby you can tell it to fall back to SMS if it isn't able to reach a data network or if the recipient isn't available via a data network.

This is under:

    Settings app > Messages > Send as SMS.

For some reason - my iPhone5 wasn't doing this. I could send iMessages fine - I could send SMS's fine - but fallback from iMessage to SMS when *the recipient* was unavailable - nope. It's supposed to time out and fall back after about 5 mins.

I'd tried turning 

    Send as SMS

off and on - no help.

Then - under

    Settings > Messages > Send & Receive

I noticed that my phone number was listed under the *"You can be reached by iMessage at:"* list but not under the *"Start new conversations from:"* list.

It makes sense (at least to me) that a message sent from an e-mail address can't fall back to SMS - but why was the number not available? It's automatically there on the receive list and I could not see any way to add it to the send list.

So - I tried turning iMessage off and on. After about 5 mins - bingo - the number came into the *"Start new conversations from:"* list.

But there was a final wrinkle. Fallback to SMS would not work for any conversations already started at this point. I had to delete them in the messages app first.

Now it works - send as iMessage times out after 5 mins and it sends as an SMS.

Oh - btw - an iMessage that's waiting can be forced to an SMS - click on it and choose *Send as SMS*.
