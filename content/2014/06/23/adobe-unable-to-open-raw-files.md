---
title: Adobe - unable to open raw files
date: 2014-06-23 19:25 +0200
tags: [adobe, lightroom, photoshop, bridge]
intro: Photoshop unable to open raw files from Lightroom
---

Some chat with @AdobeCare - see [this update](#update1) to the post. Still not solved though

---

This is an issue I've been having since my previous iMac and Lightroom4/Photoshop CS5.

Photoshop simply can't open raw files.

## Machines

I've had this on my old iMac with Lightroom 4 and Photoshop CS5.

I currently have this on my current iMac with Lightroom 4 and Lightroom 5 with Photoshop CS6, Photoshop CC and now Photoshop CC 2014.

I also have it on my macbook pro with Lightroom 5, Photoshop CC and Photoshop CC 2014.

## Files

This affects DNG raw format files that are originally from:

- D700 (Nikon NEF)
- D4S (Nikon NEF)
- S100 (Canon CR2)
- X100S (Fuji RAF)

## Symptom

Open raw file from Lightroom in Photoshop. Photoshop starts but no image opens.

Non-raw files work fine. It's just raw.

I can also repeat this with bridge instead of Lightroom. Same error.

I also see strangeness in Adobe Photoshop -> Automate (photomerge and merge to HDR pro) - again - it can't open raw files.

## Cause?

I have no idea. The multiple machine issue makes me wonder if it's something to do with my account. Just guessing tho.

## What have I tried?

I've tried trashing my adobe prefs - no help. I tried installing on the macbook pro (clean osx install). This helped for about 10 minutes. Then back to the same issue.

Last thing I did was to uninstall every adobe app I had on my iMac then reinstall just those I currently use (Lightroom 5, Photoshop CC 2014, InDesign CC 2014). Still no help.

## Workaround

Currently I have to export from Lightroom as tiff to same folder, sync the folder to get the tiff into Lightroom and then open in Photoshop. Means that you lose a lot of the continuity, and means that the library is getting lots of odd duplicate tiff files.
Cam

## Next steps?

No idea :(

I've tried asking in the forums - no-one could give me a fix.

I've tried today using adobe's support help chat.

- Log in
- Help
- Chat
- Fill out the description in detail
- Submit
- Wait
- Wait
- Wait
- Get a "You're now talking to ..." and someone's name
- Then **instantly** over to "Chat is not currently available".

Rinse & repeat. Tried both chrome and firefox.

---

<a name="update1"></a>

## Update - 23/06 - 22:00

Long back and forward with @AdobeCare on twitter. Came down to "reinstall adobe camera raw". Only issue is I can't find a later ACR than 7.1 on the downloads page. Only the DNG converter.

Since Photoshop CC 2014 comes with 8.5.0.236 Camera Raw - 7.1's not going to work.

Now - I did reinstall the DNG converter.

Now - if I open raw files from bridge or Photoshop File > Open I get them in Camera Raw and can open them from there in Photoshop.

But opening from Lightroom and the broken Automate actions - these still fail.

@AdobeCare suggest that now I need to use Chat (which I'd already tried) or phone (which as far as I can see from the page they linked me to requires payment since I don't have some kind of enterprise agreement).

So - no real progress then - since editing the original raw files is kinda useless for a Lightroom user who starts with edits in Lightroom.
