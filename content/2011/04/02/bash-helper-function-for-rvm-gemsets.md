---
title: bash helper function for rvm gemsets
date: 2011-04-02 11:23:20 +0200
tags: [ruby, rvm, bash]
---

By convention I use an rvm gemset per project - named after the directory that the project lives in.

For example src/rails/foo would have gemset foo

Since I switch a lot between machines - I always end up having to go check if the gemset exists and create it if not.

A small bash function (dump it in .bash_profile) and then when in the projects home dir you can just run rvmgo (or if you want a different ruby then e.g. rvmgo 1.8.7) and it will switch to the correct version/gemset creating the gemset if needed.

Note - it will not install a missing ruby.

```ruby
function rvmgo {
    ver=1.9.2
    ver=${1-$ver}

    pwd=${PWD##*/}

    rvm $ver
    if [ $? == 0 ]; then
        # rvm to a non existing version will set $? to 1. However rvm to a non existing gemset in an existing version
        # returns 0 and an onscreen error - so we need to check for the gemset another way
        rvm $ver@$pwd
        gemdir=`rvm gemset dir`
        if grep -q $pwd <<<$gemdir; then
            echo "Changed to $ver@$pwd"
        else
            rvm gemset create $pwd
            rvm $ver@$pwd
        fi
    fi
}
```
