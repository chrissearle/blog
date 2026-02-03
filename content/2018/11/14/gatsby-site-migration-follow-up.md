---
title: Gatsby site migration - follow up
date: 2018-11-14 20:51 +0100
tags: [javascript, react, gatsby, middleman]
intro: Nearly finished migrating to gatsby
---

So - the migtation [started a few days ago](/2018/11/10/update-blog-engine-to-gatsby/) is now more or less complete.

This has been applied on two blogs

- [https://www.chrissearle.org](https://www.chrissearle.org/) - this site - mostly tech
- [https://www.searle.me.uk](https://www.searle.me.uk/) - personal site - photo/radio control/3D printing etc etc

The personal site uses more complex code oddly enough - it switched from html to rehype/htmlAst to do [custom components in markdown](https://using-remark.gatsbyjs.org/custom-components/)
to replace the old middleman helpers. It also uses the fluid sharp image handlers to get better image handling for the lists page. Finally
it has a more complex gatsby-node to handle both categories (fixed categorization) and series (adhoc sets of articles).

Mostly I've been very pleased with how it has gone - about the only thing I still am not 100% happy with is the naming issue
mentioned in the last post - to recap:

- I'm not too fond of the renaming of files that [gatsby-remark-copy-linked-files](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-copy-linked-files) does for linked files - but not so much that I can't live with it for now
