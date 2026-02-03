---
title: Migrating to chruby
date: 2016-03-09 08:54 +0100
tags: [ruby, rvm, rbenv, chruby, ruby-build, ruby-install, bundler]
intro: Moving from rbenv to chruby
---

### Migration

Up until recently I have been using [rbenv](https://github.com/rbenv/rbenv) as my ruby install manager (along with [ruby-build](https://github.com/rbenv/ruby-build)).

I switched to this a long time back from [rvm](https://rvm.io/) - with rvm I was having a number of issues with library versions of iconv, xml etc that rbenv didn't seem to have.

Yesterday I heard about [chruby](https://github.com/postmodern/chruby) - which does not rely on shimmed binaries - it simply changes the environment (PATH etc) to point to the ruby you want. This seems a lot simpler/cleaner conceptually.

Since ruby-build is written alongside rbenv and the chruby dev writes [ruby-install](https://github.com/postmodern/ruby-install) alongside chruby we might as well change to that too.

So I decided to try it out.

This is on OSX using homebrew (my normal development setup).

Let's get rid of the rbenv bits

    brew uninstall rbenv ruby-build

Now install chruby and ruby-install

    brew install chruby ruby-install

Now - you then can add the following to your bashrc/zshrc:

    source /usr/local/share/chruby/chruby.sh

But - for zsh I'm using [zprezto](https://github.com/sorin-ionescu/prezto) with ruby module loaded and this has support for rvm, rbenv and chruby built in - so I didn't need that.

In any case - start a new instance of the shell and then install the latest ruby - I wanted both 2.3.0 and 2.2.4

    ruby-install ruby 2.3.0
    chruby ruby-2.3.0
    gem install bundler
    ruby-install ruby 2.2.4
    chruby ruby-2.2.4
    gem install bundler

Since all my projects use bundler/Gemfile - I do need bundler installed for each ruby

Now - all I wanted to add was default to 2.3.0 - so at the end of my zsh initialization I just added

chruby ruby-2.3.0

And finally - I want it to pay attention to .ruby_version files - which you can do by adding the following to bashrc/zshrc

    source /usr/local/share/chruby/auto.sh

In zprezto's ruby module - instead all you need to do is to add the following to .zpreztorc

    zstyle ':prezto:module:ruby:chruby' auto-switch 'yes'

You can configure chruby to see the rbenv/rvm installed rubies - but I chose to reinstall and to remove the older ruby installations - seems cleaner.

### Bundler

Slightly related - I use the following in my ~/.bundle/config file

    ---
    BUNDLE_PATH: vendor/bundle

This means that when I run bundle in the root of a project - all gems are installed to vendor/bundle in that project directory.

And then in my ~/.gitignore I add

    vendor/bundle

This gives me a completely separate bundle for each project - but makes sure that the git repository doesn't get the files. The only thing it then requires is that you run things with bundle exec - which has become a habit.
