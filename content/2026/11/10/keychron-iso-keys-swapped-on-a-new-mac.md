---
title: Keychron ISO keys swapped on a new Mac
date: 2026-11-10 11:29 +0100
tags: [mac, hardware, keyboard, keychron]
intro: On a new Mac with the Norwegian input source, two keys on my Keychron keyboards (a K5 Pro and a K3) were swapped even after marking for ISO layout.
---

On a new Mac with the Norwegian input source, two keys on my Keychron keyboards (a K5 Pro and a K3) were swapped: the `'` key left of `1` and the `<` key right of left Shift.
The built-in keyboard was fine.

When I connected it - I get the unrecognized keyboard - press the button to the right of the left shift - and then chose ISO - but the keys were still swapped.

However - the error is exactly what you would expect if ANSI was still selected, exactly these two keys come out swapped.

So - next up inspecting the keyboard type file on the command line. The settings live in `/Library/Preferences/com.apple.keyboardtype`:


    defaults read /Library/Preferences/com.apple.keyboardtype

    "0-0-0" = 41;
    "561-13364-0" = 40;
    "593-13364-0" = 40;

The keys are `productID-vendorID-0` in decimal, and the values are 40 for ANSI, 41 for ISO and 42 for JIS. The assistant had written ISO to `0-0-0` and left the real keyboards as ANSI. This happened on both external Keychron keyboards.

## Fix

Find the keyboard's IDs (hex) via hidutil:

    hidutil list | grep -i keychron | awk '{print $1, $2, $7}' | sort -u

    0x3434 0x231 USB

Then set that keyboard's entry to ISO and replug it:

    sudo defaults write /Library/Preferences/com.apple.keyboardtype \
      keyboardtype -dict-add "561-13364-0" -integer 41

Keychron's vendor ID is 0x3434, which is 13364 in decimal. The K3 is 0x231 (561) and the K5 Pro is 0x251 (593). The K3 reports the same IDs over USB and Bluetooth, so one entry covers both.
