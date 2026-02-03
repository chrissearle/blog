---
title: Hudson CI testing for grails from git
date: 2009-04-18 13:19:38 +0200
tags: [glassfish, grails, git, hudson, ci, continuous integration]
image: /images/posts/2009/04/hudson-ldap.png
---

After running continuous integration with [continuum](http://continuum.apache.org/) for a long while (which works great for maven projects) I decided to take a look at [Hudson](https://hudson.dev.java.net/). It can also do maven - but seems to have a larger range of plugins available. Of interest to me was [grails](http://grails.org).

**Installation**

This was extremely simple - I just grabbed the hudson.war file from the hudson site and deployed it in a running glassfish.

**LDAP configuration**

This was a bit more complex. Under Manage Hudson > Configure System

![Hudson LDAP config](/images/posts/2009/04/hudson-ldap.png)

Note the User/Group names - <code>ROLE*ADMIN</code> and <code>ROLE_HUDSON</code>. For this to work you need <code>groupOfUniqueNames</code> entries directly under the group search base (here <code>ou=groups,dc=chrissearle,dc=net</code>) with the names <code>cn=admin</code> and <code>cn=hudson</code>. Hudson will match this by removing ROLE* and lowercasing the rolename. This was unclear in the hudson docs I was reading but google came to the rescue.

**Plugins**

To be able to test grails projects from git I installed the grails and git plugins (Manage Hudson > Manage Plugins > Available). Check them off (and any others you want) and then install them.

Each plugin will add a config section under Manage Hudson > Configure System.

For git:

![Hudson - git](/images/posts/2009/04/hudson-git.png)

Since git is in the path this is OK - otherwise set the full path.

For grails:

![Hudson - grails](/images/posts/2009/04/hudson-grails.png)

Here only grails 1.0.4 is configured - but you can add several different versions.

**Project**

Now lets add a grails project.

Choose New Job from the main menu.

![Hudson - build](/images/posts/2009/04/hudson-build.png)

Add a name and choose free-style.

To configure the project - choose git from the SCM configuration section - my projects have the ability to be cloned over http - so just add the clone URL as the git repository url. Set a branch if you're not testing master.

For build triggers - I chose to poll the SCM with the following schedule <code>_/5 _ \* \* \*</code>

For build choose "Add build step" and choose Build with Grails. You'll need to pick which grails installation from the dropdown (these were configured above) and also target.

I normally add two grails build steps - one for target test, one for target war - so that if it fails then the notification tells me which step.

Finally set whichever notification options you want. Git specific is the ability to tag the original repository with the test.

**Other plugins**

For me the other plugins that are useful are JIRA (if the last commit message contains a JIRA tag then it will comment in the JIRA issue when the test passes), and email/jabber/irc/twitter notifications.
