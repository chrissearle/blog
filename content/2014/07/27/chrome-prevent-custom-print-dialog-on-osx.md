---
title: Chrome - prevent custom print dialog on OSX
date: 2014-07-27 22:14 +0200
tags: [chrome, mac, osx]
intro: I prefer the mac os print dialog instead of the chrome one. Use defaults to get it to use the system dialog.
---

I dislike Chrome's custom print dialog - I always end up clicking the use system print dialog button.

This kills Chrome's custom print dialog

```shell
defaults write com.google.Chrome DisablePrintPreview -boolean true
```

I'm guessing (haven't tried) that you can reset with one of

```shell
defaults write com.google.Chrome DisablePrintPreview -boolean false
```

or

```shell
defaults delete com.google.Chrome DisablePrintPreview
```
