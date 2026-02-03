---
title: Testing expansion in exim4
date: 2007-11-26 17:33:03 +0100
tags: [exim4, testing, expansion, lsearch]
---

General expansion testing (needed this for testing [Setting outgoing IP](/2007/11/26/setting-outgoing-ip-address-for-domain-in-exim4/):

    exim4 -be '${lookup{string_to_get_value_from}lsearch{file_to_look_in}}'

or

    exim4 -be '${lookup{string_to_get_value_from}lsearch{file_to_look_in}{$value}{default_if_not_found}}'

etc etc.
