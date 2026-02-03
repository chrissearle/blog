---
title: Subversion with svn+ssh
date: 2005-05-20 20:34:29 +0200
tags: [debian, subversion, ssh]
---

Setting up subversion with svn+ssh access (non-DAV) on unstable.

In migrating from woody with a combination of CVS and a backport of SVN 1.0 I would like to use SVN 1.1 to get the file system backend (fsfs) instead of BerkleyDB.

Repositories will reside in /repository.

Users that use them will be a member of the repository group.

**Install subversion**

```shell
apt-get install subversion
```

**Set up /repository**

```shell
mkdir repository
chown root.repository /repository
chmod 775 /repository
```

\*_Create a repository_

```shell
umask 002
newgrp repository
svnadmin create --fs-type fsfs /repository/name_of_repository
```

**Getting svn+ssh to handle permissions gracefully (handling umask)**

```shell
mv /usr/bin/svnserve /usr/bin/svnserve_real
```

**Then create a new file /usr/bin/svnserve with the following contents**

```shell
#!/bin/sh

umask 002
/usr/bin/svnserve_real "$@"
```

This will set umask so that group permissions are OK. The one annoyance is that you will need to repeat this step each time subversion is updated via an apt upgrade. I keep a copy of this script in /usr/bin/svnserve_wrapper
