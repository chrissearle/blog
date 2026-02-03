---
title: Gradle toolchain detection of mise-en-place SDKs
date: 2025-05-05 08:27 +0200
tags: [java, kotlin, gradle, mise, mise-en-place]
intro: Gradle toolchain support doesn't currently detect mise-en-place SDKs but there is a workaround.
---

Gradle toolchain support doesn't currently detect mise-en-place SDKs.

However - it does detect ASDF SDKs and mise-en-place uses a similar enough structure.

This is documented on [mise-en-place - gradle toolchains detection](https://mise.jdx.dev/lang/java.html#gradle-toolchains-detection)

For now:

```shell
mkdir -p ~/.asdf/installs/ && ln -s ~/.local/share/mise/installs/java ~/.asdf/installs/
```
