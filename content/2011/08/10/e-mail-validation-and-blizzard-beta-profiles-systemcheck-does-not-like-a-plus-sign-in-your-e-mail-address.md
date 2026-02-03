---
title: E-mail validation and Blizzard beta profiles - SystemCheck does not like a plus sign in your e-mail address
date: 2011-08-10 07:48:39 +0200
tags: [blizzard, email, validation]
image: /images/posts/2011/08/battle.net-systemcheck.png
---

I've been annoyed about this for a long time. Forms that simply reject e-mail addresses with a + in them (perfectly valid according to the standards/RFC's - see [RFC 2822](http://www.faqs.org/rfcs/rfc2822.html) 3.2.4 Atom - definition of atext).

Well - we need to add systems that allow you to set a valid e-mail with a + in but then fail.

I finally managed to register my systems profile using Blizzard's battle.net SystemCheck.

I've been trying to do this for a few years - without success - even with help from Blizzard support.

Analysis went fine - but sending the report always failed.

It always gave "There was a problem sending your system information to Battle.net":

![Screenshot](/images/posts/2011/08/battle.net-systemcheck.png)

Every FAQ on it suggests network issues or similar. This time I even got around to using wireshark to prove that the connection was OK.

Yesterday they finally sent me the real reason: _Submission will fail if your e-mail address has a + in it_.

Am mentioning this here since I didn't find it anywhere on google and I spent an awful long time looking.

So - if you want to register a beta profile on battle.net using SystemCheck then make sure you don't have a plus sign in your e-mail address.
