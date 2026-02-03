---
title: Update this blog's engine from middlemanapp to gatsby
date: 2018-10-11 14:38 +0100
tags: [javascript, react, gatsby, middleman]
intro: Moving from middlemanapp to gatsby to get some more flexibility
---

This site has for a long time been generated using the [middlemanapp](https://middlemanapp.com) site generator.

I've always found it to be slightly awkward - especially when it's time to update dependencies - since it's ruby based and I don't spend that much time in the ruby world any more.

However - my day job has a lot of react - so I thought it time to finally check out [Gatsby](https://www.gatsbyjs.org/).

I'd looked at this before but never really got the feel for it. However - this time - with a good example from [this egghead.io course](https://egghead.io/courses/build-a-blog-with-react-and-markdown-using-gatsby) I managed to get it working surprisingly quickly.

Some things I've changed from the normal gatsby/markdown setup - things like generating the path for a page based on its filename rather than a frontmatter path entry.

Status:

- There are some parts still to do: [github issues list](https://github.com/chrissearle/www_cso/issues)
- I can't test all the google search/google adsense stuff until its on the correct domain - so they may/may not work right just now
- I'm not too fond of the renaming of files that [gatsby-remark-copy-linked-files](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-copy-linked-files) does for linked files - but not so much that I can't live with it for now
