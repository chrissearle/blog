---
title: A + in an e-mail is valid. Can't we stop using validators that don't follow the standard?
date: 2011-03-16 06:53:59 +0100
tags: [email, rfc]
---

This is something that has long irritated. Websites that use form validation or similar that rejects e-mail with a + sign in the left part.

**Background**

Why would you want to? Well - quite a lot of e-mail servers (including gmail - which we'll use for examples here) take:

* foo@gmail.com
* foo+bar@gmail.com
* foo+whatever_you_want@gmail.com

All of these will be delivered to foo@gmail.com. This allows you to give unique e-mails to each site out there while still only needing the one account - makes filtering in gmail easier, and allows you to track who's selling what to others too ;)

**Standards**

What says that the + is valid?

E-mail addresses are regulated by a set of RFC documents.

The original, [RFC822](http://www.faqs.org/rfcs/rfc822.html), this was replaced by [RFC2822](http://www.faqs.org/rfcs/rfc2822.html) and finally this was updated for internationalization in [RFC5335](http://www.faqs.org/rfcs/rfc5335.html).

In 2822 - the relevant section is 3.4.1.

<blockquote>An addr-spec is a specific Internet identifier that contains a
   locally interpreted string followed by the at-sign character ("@",
   ASCII value 64) followed by an Internet domain.  The locally
   interpreted string is either a quoted-string or a dot-atom.  If the
   string can be represented as a dot-atom (that is, it contains no
   characters other than atext characters or "." surrounded by atext
   characters), then the dot-atom form SHOULD be used and the
   quoted-string form SHOULD NOT be used. Comments and folding white
   space SHOULD NOT be used around the "@" in the addr-spec.</blockquote>

What this says is that the valid chars for the local-part (left of the @ sign) are made up of one of the following:

* dot-atom
* quoted-string
* obs-local-part

If you dig through - dot-atom is made up from dot-atom-text - which in turn is made up of atext.

<blockquote>
<pre>
atext           =       ALPHA / DIGIT / ; Any character except controls,
                        "!" / "#" /     ;  SP, and specials.
                        "$" / "%" /     ;  Used for atoms
                        "&" / "'" /
                        "*" / "+" /
                        "-" / "/" /
                        "=" / "?" /
                        "^" / "_" /
                        "`" / "{" /
                        "|" / "}" /
                        "~"
</pre></blockquote>

All of these are valid.

822 used a slightly different layout - local-part is made up of atom or quoted string, atom is one or more "any CHAR except specials, SPACE and CTLs" - and the specials do not include +.

5332 replaces atext with utf8-atext - guess what - the + is still there ;)

**Issues**

There seem to be a lot of broken validators out there that have an incorrect set of characters. The one that gives the most issues seems to be the + sign. Not sure why - but it seems quite a common issue.

Even worse is when it's allowed on the registration page but rejected by the login page (where e-mail is used at login).

A smaller issue are sites that fail to handle the encoding of this when displaying it (a + urldecodes to a space - so you have to encode it first). This is just broken webpage design - but when the confirmation page displays the address as "foo bar@gmail.com" instead of "foo+bar@gmail.com" and the form wizard fails to complete with an email validation error on the confirmation page (usually without the ability to edit the field) - that's just as annoying.

**Summary**

If you're going to validate e-mail addresses (a good idea) then please use a validation library that is correct. Don't assume that you know what an e-mail looks like - the valid combinations are wildly more varied than most people realize. Don't assume a simple regular expression is good enough (see [this regex](http://www.ex-parrot.com/pdw/Mail-RFC822-Address.html)).

Oh - and asking your users to change their e-mail due to your broken validation is not something that makes them feel good towards your brand!
