---
title: Migrating to next.js
date: 2022-02-19 12:23 +0100
tags: [javascript, react, gatsby, next.js]
intro: Moving platform for a static site from gatsby to next.js
---

I've been using gatsby as the generator engine for two sites since 2018.

It's worked very well - powerful and flexible.

But - I've always stuggled with keeping it up to date. There are so many packages and plugins and something always breaks.

So - now I was faced with a v2 to v4 two step major update.

It appeared to go well - most things just worked - but - there are some oddities that I can't find out about.

Some of the power in gatsby is its graphql support - and - it seems now that this is overkill for what I need.

I decided to make a jump over to next.js to try that out - again - just as a static site generator.

Imopressions so far are that it is simpler to work with. Static pages are static pages. Dynamic pages each provide their "here is the list of the pages I can be" via a call to `getStaticPaths` and provide the display content via a call to `getStaticProps`.

Beyond that - the logic is mine - and I don't need a lot of that. The rest is all just simple react functional components.
