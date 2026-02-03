---
title: Too many open files on OSX/macOS
date: 2016-10-01 12:18 +0200
tags: [osx, mac, ulimit]
intro: Using launchd to bump max files - similar to sysctl on linux
---

I use my macs for development. That means that there's a lot of things running and I usually have a lot of heavy apps open. So I quite often hit the error "Too many open files". On linux - this is fixed using sysctl - but on later OSX/macOS it is done using launchd. Earlier OSX versions could use a /etc/launchd.conf file - but - for the latest versions I've found that this post [from basho docs for riak](https://docs.basho.com/riak/kv/2.1.4/using/performance/open-files-limit/#mac-os-x) works fine.

In short - create two files

**/Library/LaunchDaemons/limit.maxfiles.plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>200000</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

**/Library/LaunchDaemons/limit.maxproc.plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple/DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxproc</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxproc</string>
      <string>2048</string>
      <string>2048</string>
    </array>
    <key>RunAtLoad</key>
    <true />
    <key>ServiceIPC</key>
      <false />
  </dict>
</plist>
```

Make sure both are owned `root:wheel` and have permissions `-rw-r--r--` and then either restart or reload the launchd config.

`ulimit -n` and `ulimit -u` can be used to test the results afterwards.
