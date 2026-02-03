---
title: Fun with Flexus
date: 2009-11-02 17:47:46 +0100
tags: [flexus, ticketing, electronic ticketing]
---

Doesn't it seem strange that the new ticket system in Oslo seems to have parts that don't talk to each other?

[Flexus](http://www.ruter.no/flexus) is the new electronic ticketing system for Ruter and NSB in Oslo.

I use it for the simple reason that the new machines can accept payment via bank card - not cash - and the only local shop is often not open when I leave for work in the morning.

You load ticket(s) onto the card - and activate it when the previous one runs out. So - at any time you have some combination of expired tickets, one active ticket and non-started tickets.

### The flexus user experience

This morning I loaded up a new month card - 550,- NOK. Validated at the same place - and it showed the ticket activated with a new end date - in one month. All fine.

After switching to a bus - I got a **No valid ticket** error.

Last time I had an error (Error Code 68) I had checked online at [minruter.no](https://minruter.no) and found that the ticket was OK. So this time I checked again - no ticket activity for 2 days. No valid ticket.

So I called trafikanten on the phone. During this conversation I learned the following [^1]:

* Trafikanten issued flexus cards have light grey serial number (NSB have black) - and that meant he had a chance to help me (seems that NSB issued flexus cards can only get help at NSB)
* Error code 68 means invalid pin code (and neither I nor the person on the telephone could make any sense of that - flexus doesn't use pin codes).

But I didn't learn why I had seemingly lost a ticket.

So - I was asked to bring the card in to trafikanten in Oslo town centre.

Here - there was a queue system - only 52 people in front of me [^2].

And after a long wait - I was told [^1]:

* You have a valid ticket - *if he could see it - why couldn't the telephone operator?*
* Buses that have left the depot before you add the ticket to the card won't know about the ticket - since they have not been updated since leaving the depot
  * Follow up question - ticket inspectors can read the ticket from the card - *in which case - why can't the bus?*
* The webpages can take up to 24 hours to show an update - *how come the flexus system can know about the update in a timely manner but not the user interface?*

For a new and supposedly modern system (even though there has been a lot of criticism and a fair few delays) - this seems at best cobbled together of bits that don't want to talk to each other.

Oh - and it seems like a *very* good idea to carry the receipt you get when you load the card *with* the card.

[^1]: I can only go on what I was told - I have no idea how much actually is how flexus works - but it does seem to match the days experiences.
[^2]: I have to say that trafikanten in town did move throught the queue pretty fast.
