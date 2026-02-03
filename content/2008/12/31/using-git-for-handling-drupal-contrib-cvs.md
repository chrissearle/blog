---
title: Using git for handling drupal contrib CVS
date: 2008-12-31 13:39:08 +0100
tags: [drupal, git, cvs]
---

Using git for handling CVS checkouts for drupal contrib

Details are on [Maintaining a Drupal module using Git](http://drupal.org/node/288873)

For Mac OSX users you will need cvsps (fink install cvsps for example).

Useful alias for your .gitconfig:

    drupalcontribcvs = !sh -c 'git cvsimport -p x -v -d:pserver:anonymous@cvs.drupal.org:/cvs/drupal-contrib contributions/modules/$0'

This allows you to call

    git drupalcontribcvs <modulename>
