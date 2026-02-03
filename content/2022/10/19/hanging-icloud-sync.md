---
title: Hanging iCloud sync
date: 2022-10-19 14:07 +0200
tags: [icloud, osx, mac, synchronization, bird]
intro: How to fix the issue when iCloud sync says its at X of X and doesn't progress?
---

iCloud sync (documents etc) can be a little unstable.

One of the most irritating things is when the sync status shows X of X complete (i.e. should actually be complete)
but the progress bar does not move and no new files are synchronized.

The usual method to solve this seems to be

- remove the Documents folder from your iCloud setup
- then re-add it

This is a major pain and can take time.

The process running the synchronization is called `bird`. On my current system it lives in:

```shell
/System/Library/PrivateFrameworks/CloudDocsDaemon.framework/Versions/A/Support/bird
```

I found a couple of suggestions that can be tried:

- niceness
- restarting bird

Neither of these have been 100% - but are both worth trying before resorting to the remove/add back fun and games.

## niceness

One is to up the priority of the process.

```shell
ps aux | grep bird
username            92783   0.0  0.1 33911140  18804   ??  S     1:26PM   0:13.39 /System/Library/PrivateFrameworks/CloudDocsDaemon.framework/Versions/A/Support/bird
```

From this - I can see that bird is running as process id (pid) 92783.

Let's see the current priority:

```shell
ps -fl -C 92783
  UID   PID  PPID   C STIME   TTY           TIME CMD                     F PRI NI       SZ    RSS WCHAN     S             ADDR
  501 92783     1   0  1:26PM ??         0:13.41 /System/Library/     4004  31  0 33911140  18804 -      S                   0
```

So - priority is also known as the niceness of the process - and the default value (`NI`) here is 0.

Let's say "make that a bit more agressive". The more negative the _less_ nice (more agressive). This also needs running with admin rights - hence the sudo. Remember to set the correct PID

```shell
sudo renice -n -5 -p 92783
```

## Restart bird

This is as simple as killing the bird process with something like `kill PID` or `killall bird` (be careful with killall)

This second option is perhaps the one that works for me most often.

And here's something I don't understand - this seems to work better than restarting the system. This makes _absolutely zero sense_ to me - but - I have had a system where a restart just starts up in the hung position and then after killing bird - synchronization starts up again.
