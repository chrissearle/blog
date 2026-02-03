---
title: Exim4 shouldn't give up just because clamav died
date: 2008-04-08 11:01:09 +0200
tags: [debian, exim4, clamav]
---

I was having the issue that if clamav died (usually due to freshclam update taking too long) that exim4 would start temporary rejecting ALL mail.

Here's a suggestion from Mike Cardwell on the exim users mailing list. It adds a check on the file existing and adds a header if not instead of rejecting.

    warn !condition = ${if exists{/var/run/clamav/clamd.ctl}}
         add_header = X-Virus-Checked: False
    deny condition  = ${if exists{/var/run/clamav/clamd.ctl}}
         malware    = *

See also [http://lists.exim.org/lurker/message/20070918.172526.ff9818ec.en.html](http://lists.exim.org/lurker/message/20070918.172526.ff9818ec.en.html) for a more detailed method.
