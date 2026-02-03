---
title: Migrating Jira and Confluence from Tomcat to Glassfish
date: 2008-07-11 09:21:58 +0200
tags: [apache, tomcat, jira, confluence, atlassian, glassfish, mod-jk, mod-proxy]
---

I have had jira and confluence running under tomcat 5.5.23 (behind apache over AJP13/mod_jk) for a while now. The aim is to migrate them over to glassfish (behind the same apache but with mod_proxy).

Software versions:

*  Atlassian Jira 3.12.2
*  Atlassian Confluence 2.8.0
*  Apache Tomcat 5.5.23
*  Glassfish 2.1 build 39

First - some links I found useful:

*  [http://blogs.steeplesoft.com/jira-and-glassfish/](http://blogs.steeplesoft.com/jira-and-glassfish/)
*  [http://java.stake-online.com/blog/2007/04/glassfish-v2-and-atlassians-jira-and.html](http://java.stake-online.com/blog/2007/04/glassfish-v2-and-atlassians-jira-and.html)

So - what changes had to be made?

###Jira

In the jira download area (where you build the war) - I had only one file in edit-webapp from when building for tomcat - edit-webapp/WEB-INF/classes/entityengine.xml. In this file I had to change the JNDI names for UserTransaction and the datasource - removing java:comp/env (this seems to be a difference between tomcat and glassfish, tomcat wants the whole path where glassfish assumes you are in the env section of the JNDI tree - affects confluence too - see below).

Then a simple <code>./build.sh war</code> and a new war was generated. I deployed the dist-generic rather than the dist-tomcat war file to glassfish using the GUI.

###Confluence

Easier than JIRA - just deploy the same expanded directory that tomcat was using (I had confluence expanded on disk and had used a config in tomcat/conf/Catalina/localhost to point to it).

Changes required - in confluence_home there is a confluence.cfg.xml - defines amongst other things the datasource. You need to make the same change here to the JNDI name - remove java:comp/env

###Datasources

Remember that for both you must have:

1.  Defined your datasource in glassfish resources (admin GUI)
1.  Have the correct JDBC driver in glassfish/lib

###mod_jk -> mod_proxy

Mod proxy was already available on the server (debian makes it very simple to enable) - so all I had to do was to replace

    JkMount /jira tomcat_worker

with

    ProxyPass /jira http://localhost:8080/jira
    ProxyPassReverse /jira http://localhost:8080/jira

###Other changes

Both jira and confluence are displayed under https using a self-certified certificate in apache2. The jiraissues macro in confluence will call jira over this. Therefore glassfish JVM must trust the certificate. Under tomcat I had the certificates in the default JVM stores $JAVA_HOME/jre/lib/security/cacerts and jssecerts. Glassfish has its own under domains/domain1/config.
