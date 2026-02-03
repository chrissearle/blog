---
title: Git commit mail (debian)
date: 2009-01-04 13:34:00 +0100
tags: [debian, mail, git, git 1.6, commit, email, commit e-mail]
---

With the backported git 1.6 packages installed - to add mailing lists for commits/tags:

    cd src/<project>.git/hooks
    ln -s /usr/share/doc/git-core/contrib/hooks/post-receive-email post-receive
    git config --add hooks.mailinglist "development@mailhost.tld"
    git config --add hooks.announcelist "announce@mailhost.tld"
    git config --add hooks.envelopesender "from_addr@host.tld"

Note that <code>/usr/share/doc/git-core/contrib/hooks/post-receive-email</code> must be executable - chmod a+x if you need to.
