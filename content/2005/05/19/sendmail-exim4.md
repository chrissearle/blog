---
title: sendmail -> exim4
date: 2005-05-19 12:18:29 +0200
tags: [debian, exim4, sendmail, clamav, spamassassin]
---

Have been running sendmail for a long time on woody. However - with the upgrade to sarge I've been taking a look at exim's configuration - since the sendmail config is a nightmare :)

Status so far

**Installation**

```shell
apt-get install exim4-daemon-heavy
```

This got exim4 down and removed sendmail. No debconf prompts came up at all. Some searching in debian-user gave me

```shell
dpkg-reconfigure exim4-config
```

Good start - got it listening on more than 127.0.0.1 and got the list of local names installed.

**Spamassassin**

I was using a sendmail milter to run spamassassin - for exim an apt-cache search gave me a hint

```shell
apt-get install sa-exim
```

The /usr/share/doc/sa-exim/README.Debian is a good file to read.

**ClamAV**

Here's another useful link (good for the clamav stuff):

[http://koivi.com/exim4-config/](http://koivi.com/exim4-config/)

From this I took the following:

```shell
apt-get install clamav-daemon spamassassin spamc
```

An addition that I discovered - you need to edit /etc/default/spamassassin and set ENABLED=1 or it won't even start.

Add the following to your /etc/exim4/conf.d/main/01_exim4-config_listmacrosdefs file:

```text
# This tells what virus scanner to user
av_scanner = clamd:/var/run/clamav/clamd.ctl
# Slowing spammers down by holding their connection a bit
TEERGRUBE = 60s</code>
```

Edit /etc/exim4/conf.d/acl/40_exim4-config_check_data to inlude the following before the "# accept otherwise" line:

```text
# Reject messages that have serious MIME errors.
# This calls the demime condition again, but it
# will return cached results.
deny message = Serious MIME defect detected ($demime_reason)
demime = *
condition = ${if >{$demime_errorlevel}{2}{1}{0}}
.ifdef TEERGRUBE
    delay = TEERGRUBE
.endif
# Reject file extensions used by worms.
# Note that the extension list may be incomplete.
deny message = This domain has a policy of not accepting certain types of attachments \
                in mail as they may contain a virus.  This mail has a file with a .$found_extension \
                attachment and is not accepted.  If you have a legitimate need to send \
                this particular attachment, send it in a compressed archive, and it will \
                then be forwarded to the recipient.
demime = exe:com:vbs:bat:pif:scr
.ifdef TEERGRUBE
    delay = TEERGRUBE
.endif
# Reject messages containing malware.
deny message = This message contains a virus ($malware_name) and has been rejected
malware = *
.ifdef TEERGRUBE
    delay = TEERGRUBE
.endif
```

Then, you also need to set access for ClamAV. The best way to handle this is to add the clamav user to the Debian-exim group and be sure that /etc/clamav/clamd.conf contains the following lines (on a fresh sarge install the clamd.conf part was already in place):

```text
User clamav
AllowSupplementaryGroups
```

If you had to add these lines, a restart of ClamAV is necessary for the changes to take effect.

**Virtual domains**

This section is taken mostly verbatim from [Debian Administration](http://www.debian-administration.org/articles/140). This site is _highly_ recommended for all debian administrators.

- mkdir /etc/exim4/virtual
- For each domain - create a file named after that domain - for example - for this domain I created a file called chrissearle.org
- In each file - for each local user to be recognised - add <code>user : user@localhost</code>
- In each file - for each remote user to be recognised (mail forwarding) - add user : user@remote.host.tld
- At the end of each file - add a catchall address - \* : catchalluser@localhost
- In /etc/exim4/conf.d/main/01_exim4-config_listmacrosdef change the line starting domainlist list_domains with domainlist local_domains = @:localhost:dsearch;/etc/exim4/virtual
- Add /etc/exim4/conf.d/router/350_exim4-config_vdom_aliases containing

```text
vdom_aliases:
driver = redirect
allow_defer
allow_fail
domains = dsearch;/etc/exim4/virtual
data = ${expand:${lookup{$local_part}lsearch*@{/etc/exim4/virtual/$domain}}}
retry_use_local_part
pipe_transport   = address_pipe
file_transport   = address_file
no_more
```

Here I have assumed that either exim will go through a given virtual file - and send mail to the first matching address - so that the catchall address at the end gets everything that _isn't already sent somehwhere else_ or that the \* match is special and will only trigger if the mail isn't already handled (regardless of line order in the file). Whichever of these is correct - I find the files more readable with the catchall at the end. Time/the documentation will show if this assumption is correct. It's similar to the virtual user handling in sendmail.

I have also assumed that all mailman addresses will be in their respective virtual file _and_ in /etc/aliases (where you add the pipe to the mailman programs). Maybe the mailman stuff should be in these files - I'll update this when I find out.

**SMTP AUTH**

One of the main users is on a BT Yahoo broadband. I never managed to get any kind of SMTP AUTH or POP-before-SMTP or anything working with sendmail. So I cheated and opened for relaying from BT. We got away with it for slightly over a year but last weekend the server was found and began to send so much spam that it died. So - that route is out.

Now - at the same time we're setting up a sarge box with exim - so - let's get SMTP AUTH working.

I'm going to start with PLAIN and LOGIN - we can look at other ones and SSL later. One step at a time.

First - I installed the following:

```shell
apt-get install courier-authdaemon courier-imap courier-pop
```

For SSL when I get that far we'll add

```shell
apt-get install courier-imap-ssl courier-pop-ssl
```

courier-authdaemon is by default set up to use pam - that'll do for now.

In /etc/exim4/conf.d/auth/30_exim4-config_examples comment out the active plain: and login: sections

Add to a new file /etc/exim4/conf.d/auth/15_exim4-config

Update - it seems that the conf.d files are read in alphabetical order across the conf.d subdirectories - not within - it may be that this file would be better named 30_exim4-config or similar. You could always edit these sections into the examples file - but - I felt that examples were examples :)

```text
# Unix clients
plain:
    driver = plaintext
    public_name = PLAIN
    server_condition = \
            ${if eq {${readsocket{/var/run/courier/authdaemon/socket}\
            {AUTH ${strlen:exim\nlogin\n$2\n$3\n}\nexim\nlogin\n$2\n$3\n}}}{FAIL\n} {no}{yes}}
    server_set_id = $2
# Windows clients
login:
    driver = plaintext
    public_name = LOGIN
    server_prompts = Username:: : Password::
    server_condition = ${if eq {${readsocket{/var/run/courier/authdaemon/socket} \
                {AUTH ${strlen:exim\nlogin\n$1\n$2\n}\nexim\nlogin\n$1\n$2\n}}}{FAIL\n} {no}{yes}}
    server_set_id = $1
```

This code snippet I found on the net - but I've lost the URL - so - if it's yours please let me know so I can credit.

Now - /var/run/courier/authdaemon is not readable by anything other than daemon user and daemon group. The socket is rwx for everyone. I've chosen to add Debian-exim4 user to the daemon group rather than edit the permissions on the authdaemon directory - I'm not sure if this is the best. It is necessary that exim can read/write to that socket.

Restart exim and try the following (you will need to type the telnet, EHLO and QUIT lines):

```shell
# telnet localhost 25
Trying 127.0.0.1...
Connected to localhost.localdomain.
Escape character is '^]'.
220 server.domain.tld ESMTP Exim 4.50 Thu, 19 May 2005 20:15:15 +0200
EHLO foo
250-server.domain.tld Hello chris at localhost [127.0.0.1]
250-SIZE 52428800
250-PIPELINING
250-AUTH PLAIN LOGIN
250 HELP
QUIT
```

So - AUTH is supported - plain and login - good.

Now - for testing - it was easy to add to change the /etc/default/exim4 file so that COMMONOPTIONS was set to -d-all+auth

Restarting exim4 with this in place will give debug output for auth related things. It won't background as a daemon - but that doesn't matter for testing.

In Outlook outgoing mail was set to require login and to use the same username/password as incoming (POP3 or IMAP). Sent a mail and presto - it went thru using the LOGIN auth (as could be seen in the debug log).

So - I've removed the debug options and restarted - later we'll be trying to add SSL and maybe some other options (although I'm not sure what Outlook supports other than login).

**RBL blacklists**

You'll need to edit /etc/exim4/conf.d/acl/30_exim4-config_check_rcpt

Find the section with the text

```text
#############################################################################
# There are no checks on DNS "black" lists because the domains that contain
# these lists are changing all the time. You can find examples of
# how to use dnslists in /usr/share/doc/exim4-config/examples/acl
#############################################################################
```

And look in the example file in the directory listed for examples. Simple :) However - this is just warnings. My old server is stricter - and rejects. This can be done by adding acl rules of the form

```text
deny dnslists = dnsbl.njabl.org
```

**Recommended Reading**

Loads of stuff on [http://www.debian-administration.org](http://www.debian-administration.org) - simply run a search for exim.

As I get the system more up and running I'll add to this article. Things on the wishlist

- mailman (as in the config at [http://www.exim.org/howto/mailman21.html](http://www.exim.org/howto/mailman21.html) rather than the simple adding of aliases to /etc/aliases)
- SSL
- LDAP instead of PAM auth
- Mail2News gateway
- Getting my home machine to use this box as a smarthost (or whatever is most appropriate) so that my mail isn't rejected as coming from an ISP block.
