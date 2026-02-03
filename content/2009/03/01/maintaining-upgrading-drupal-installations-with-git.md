---
title: Maintaining/upgrading drupal installations with git
date: 2009-03-01 09:32:37 +0100
tags: [drupal, git]
---

This is based on http://www.versioncontrolblog.com/2007/08/02/upgrading-drupal-52-with-git/

This is a work in progress/idea dump right now - any suggestions/improvements - please do leave a comment ;)

I have quite a few sites that are using drupal. I know I could go the route of a multisite install (I've done it before) - but I found that the requirement of upgrading all sites simultaneously was a bit too hard. However - upgrading everything by hand for each site is also poor.

I've a set of shell/perl scripts to make life easier - but - this really does feel like a version control issue to me.

Googling gave me the above link at versioncontrolblog. This is a nice start. But - I can't see how to make it work for many sites. You'd end up with a drupal-and-modules dir per site.

So - here's my initial thoughts. For the following - <code>/usr/local/drupal</code> is where I'm storing things, <code>/srv/www/&lt;sitename&gt;/htdocs</code> is where sites have their document root.

## Releases

We have three types of release to retrieve - drupal itself, modules and themes.

#### Drupal

<code>/usr/local/drupal/releases/drupalX</code>

This is a git repo that contains the latest release of drupal major version X. When drupal releases a new version (e.g. drupal 6.9 -> drupal 6.10) then I just extract that on top of the correct major version, git add where necessary then commit. I also tag the result with the major and minor version.

#### Modules

<code>/usr/local/drupal/modulesX/modulename</code>

For each module that I need (for any site)- this is a git repo (per module) that contains the latest release of the module for drupal major version X. When a module releases a new version (e.g. drupal X.x-1.1 -> drupal X.x-1.2) then I just extract that on top, git add where necessary then commit. I also tag the result with the major and minor version.

#### Themes

<code>/usr/local/drupal/themesX/themename</code>

For each theme that I need (for any site) - this is a git repo (per theme) that contains the latest release of the theme for drupal major version X. When a theme releases a new version (e.g. drupal X.x-1.1 -> drupal X.x-1.2) then I just extract that on top, git add where necessary then commit. I also tag the result with the major and minor version.

The idea of the themes and modules directories here is that I should only need to work with one copy of each despite having more than one site. However I don't want every site to update to a newer module at the same time. So now let's see how this gets used for the actual sites.

## Sites

Each site is created by cloning the drupalX release repo. I then configure the settings.php (and add it), and add sites/all/themes and sites/all/modules directories (and add them). You may also choose to add sites/default/files to the git ignore list - depends if you want uploads and cached js/css/theme files to be git controlled over time.

Updates to drupal can then be handled with git pull.

To add a theme or module I can then run e..g

```shell
git submodule add /usr/local/drupal/modulesX/pathauto sites/all/modules/pathauto
```

Remember git submodule init/update if pulling a repo with submodules.

#### To update a module

If a module is updated in the /usr/local/drupal/modulesX then where it is used should also be updated

```shell
cd /srv/www/<site>/htdocs/sites/all/modules/<modulename>
git remote update
git merge origin/master
```

#### To remove a module

If a module is no longer wanted - edit .gitmodules and .git/config - remove all references. Then git rm --cached &lt;path to module&gt;. Finally - remove the module itself.
