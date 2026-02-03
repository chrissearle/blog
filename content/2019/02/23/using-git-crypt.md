---
title: Using git-crypt
date: 2019-02-23 12:18 +0100
tags: [git, encryption, github, git-crypt, gnupg]
intro: git-crypt can be used to safely and transparently encrypt secrets so that they can be stored in git
---

For a while now I have had two methods of dealing with sensitive data (usernames, passwords etc) in public git repositories. Neither were optimal.

- Ignore the file entirely - and then pass it around outside of git
- Encrypt the file under a different name and have a shell script that would trigger the decrypt if necessary.

The first one has issues about how to pass the data around.

An example of how the second option worked. For ansible repositories - the variables that are not to be publically available were placed in ansible vault files. But - how to handle the vault password.

I placed the `vault-password.txt` file in `.gitignore`, encrypted it with GnuPG to `vault-password.txt.gpg` which was committed and then added the following shell script `run-playbook.sh`:

```shell
#/bin/bash

CMD=gpg

if [ ! $(type -P $CMD) ]; then
        CMD=gpg2
fi

if [ ! $(type -P $CMD) ]; then
        echo "GPG not found"
        exit
fi

if [ ! -f vault-password.txt ]; then
  $CMD --decrypt-files vault-password.txt.gpg
fi

ansible-playbook $@
```

So - then to run a playbook instead of `ansible-playbook playbookname` it was `run-playbook.sh playbookname` and if the decrypted file was not present it would prompt for the GnuPG password for decryption otherwise it would run normally.

## git-crypt

This works with a combination of a new CLI tool (`git-crypt`), a `.git-crypt` directory and use of `.gitattributes`.

Let's migrate the previous example to git-crypt.

### Initialize git-crypt and add my key

```
cd REPO
git-crypt init
git-crypt add-gpg-user D4BF0A41
```

This creates the `.git-crypt` directory and adds my key info. This directory needs to be under source control - and `git-crypt` will commit the key file when you run `add-gpg-user`.

### Setup the files

First I made sure I had the decrypted `vault-password.txt` file in place.

- Edit `.gitignore` - remove `vault-password.txt`
- Remove `vault-password.txt.gpg`
- Remove `run-playbook.sh`
- Add `.gitattributes` file (see below)
- And finally - add `vault-password.txt`
- Commit

`.gitattributes` looks like this:

```
vault-password.txt filter=git-crypt diff=git-crypt
```

### Test

Just push to github. Locally the `vault-password.txt` file looks fine - but on github it is shown just as data - and is not readable.

### Clone to a new machine

But how do we checkout a clone on a new machine?

```
git clone URL
cd REPO
```

At this point - we've done the normal stuff - but the files are still encrypted.

```
git-crypt unlock
```

This will decrypt the working file and leave the repo setup with git-crypt.

## Installation, passwords etc

This test was run on my mac - so I used homebrew to install `git-crypt`. The repository is [https://github.com/AGWA/git-crypt](https://github.com/AGWA/git-crypt).

For GnuPG I've used brew to install `gnupg` and `pinentry-mac` (which is configured in my `gpg-agent.conf` file as `pinentry-program`). This was already in place before I started looking at `git-crypt`.
