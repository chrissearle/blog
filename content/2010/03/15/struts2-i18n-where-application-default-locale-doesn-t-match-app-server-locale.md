---
title: Struts2 i18n where application default locale doesn't match app server locale
date: 2010-03-15 20:45:42 +0100
tags: [java, glassfish, struts2, struts 2.1.6]
---

I have a struts2 (2.1.6) based webapp which has two languages - english and norwegian. The default language for the app is norwegian - the application server (glassfish 2.1) is running under the english locale.

It didn't seem to matter what value I passed in to the request_locale parameter - I always got english.

There are two language files:

* global_messages.properties (norwegian)
* global_messages_en.properties (english)

The struts constant struts.custom.i18n.resources was set to "global_messages" in struts.xml.

Googling suggested trying to set struts.locale=no in struts.xml - this may work for other versions - but did nothing under 2.1.6.

Passing in request_locale=no looked for a matching language file - and as it didn't find it - it tried to use the default language *based on the locale of the app server*

Up until now I was aware of two options

1. Run the app server under locale=no
* This would cause havoc for other english apps on the same webserver.
* This would probably be a good solution for app servers that are dedicated to an app.
1. Maintain a copy of global_mesages.properties called global_messages_no.properties
* This is not a good maintenance solution - you have two copies and can miss updates

The solution was actually pretty simple.

Create a global_messages_no.properties that **is empty**.

Then - when you set the request_locale to no it *matches* the empty file. This then does not bother looking at the locale of the app server. However - there are no matching properties *within* the file - so it falls back using the standard filename based fallback to global_messages.properties.

Exactly the result we want - the ability to switch to norwegian or english with only one copy of each. A bit of a hack but it works.

## Note

This is making it work by observation - my interpretation may be way off - however the result works for me.

If anyone knows a more correct solution (or description of the problem) feel free to add a comment - if there's a better way I want to be using it ;)
