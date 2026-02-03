---
title: Internal certificate authority with openssl and caman
date: 2019-09-18 09:40 +0200
tags: [openssl, ssl]
intro: Running a local/internal certificate authority - even though it is 2019
---

It seems a little odd to be looking at running an internal certificate authority (CA) in these days where free certificates are easily available from [LetsEncrypt](https://letsencrypt.org/). However, I have a fully working LetsEncrypt setup using the http callback verification method that I don't really want to fiddle with, so for some small internal machines (pi's etc) I wanted to look again at being my own CA.

Last time I looked at this (11 years ago) I used openssl's CA.sh/CA.pl scripts. Basically these manipulate the openssl configuration files so that the standard openssl commands create what you need.

You can do this by hand too - and just run openssl commands. But - I wanted something that added a little more control.

One script that does this for you is [caman](https://github.com/radiac/caman) - which seems to have a fairly simple interface.

The readme is pretty self-explanatory. Simply clone the repository and use it. I decided on one change. The script uses two directories - ca and store. These are in the .gitignore file (with a pair of files in ca excluded). I decided to remove the gitignore settings - and keep the generated files in the repo - but - to keep them secure with [git-crypt](/2019/02/23/using-git-crypt/). I also decided that as this was just for me and for a few machines that the extra complexity of an intermediate was not necessary - if I have to re-create the CA then there are perhaps 10 machines it needs installing on.

Apart from that - the readme's instructions worked fine - the script I more or less ended up with looks like this (so far I have added three hosts):

```shell
git clone -o upstream git@github.com:radiac/caman.git

cd caman

git remote add origin <location>

rm .gitignore

touch .gitattributes

// Add .gitattributes for git-crypt here - setting ca/** and store/** to be encrypted

cp ca/caconfig.cnf.default ca/caconfig.cnf && vi ca/caconfig.cnf
// Change the CA settings as described in the readme

cp ca/host.cnf.default ca/host.cnf && vi ca/host.cnf
// Change the per host settings as described in the readme

./caman init

for HOST in host1 host2 host3; do
  ./caman new $HOST.home.chrissearle.org
  ./caman sign $HOST.home.chrissearle.org
done

git add .

git ci -m "Done :)"
```

The final steps here:

- Install the host certificates on the machines they are for
- Install the ca (ca/ca.crt.pem) on each client that needs it
