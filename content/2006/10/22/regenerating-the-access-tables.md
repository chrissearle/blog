---
title: Regenerating the access tables
date: 2006-10-22 20:25:42 +0200
tags: [drupal]
---

After trying to run both Taxonomy Access and Simple Access - and finding that this didn't play well together (drupal 5 is supposed to be able to handle this better) the taxonomy access details were hosed. The actual taxonomies were hidden - but the nodes were displayed.

Thanks to help on the drupal forums - to rebuild this I had to:

1.  Disable taxonomy access (note - thats disable not uninstall)
1.  TRUNCATE node_access in the database
1.  Re-enable taxonomy access

This rebuilt the contents of the node access table and all started playing well together :)
