---
title: Site specific chrome launcher's on OSX
date: 2014-04-02 10:44 +0200
tags: [chrome, osx]
---

I was looking for a chrome based site specific browser (SSB) for mac. This is similar to http://fluidapp.com/ but chrome based.

I ended up using the shell script makeapp.sh - I used the version from [this gist](https://gist.github.com/sanfordredlich/4568525) - which I've also linked locally: :download{title="makeapp.sh" path="/files/posts/2014/04/makeapp.sh"}

You simply run the script - give it a name (no spaces), a URL and an icon and it will create an app in /Applications.

It seems to create a profile per app too - so I can e.g. have two different yammer app's that login to different accounts. This is useful but it does mean that you won't have your normal plugins/extensions installed. It also means that on first start of the app it asks if you want to make chrome the default browser - probably wise to say no - you'll want to keep your normal chrome profile for that :)
