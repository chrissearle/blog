---
title: Deploying jars to third party maven repository via WebDAV
date: 2008-02-10 16:21:43 +0100
tags: [java, maven, webdav]
---

Normally you deploy to a third party repository with a command similar to:

    mvn deploy:deploy-file -Dfile=/path/to/file -DrepositoryId=repositoryId
    -Durl=wagon:protocol://path/to/repo -DgroupId=groupId -DartifactId=artifactId
    -Dversion=version -Dpackaging=packageType

But - to deploy via webdav needs a snapshot wagon.

To do this - create a temporary pom in the directory you are in (create a scratch dir or similar). This should contain:

    <project>
       <modelVersion>4.0.0</modelVersion>
       <groupId>com.example</groupId>
       <artifactId>webdav-deploy</artifactId>
       <packaging>pom</packaging>
       <version>1</version>
       <name>Webdav Deployment POM</name>
   
       <build>
          <extensions>
             <extension>
                <groupId>org.apache.maven.wagon</groupId>
                <artifactId>wagon-webdav</artifactId>
                <version>1.0-beta-2</version>
             </extension>
          </extensions>
       </build>
    </project>

(thanks to [the maven archiva docs](http://archiva.apache.org/docs/1.0.1/userguide/deploy.html) for this pom).

Now - in that directory you can now run something similar to

    mvn deploy:deploy-file -Dfile=/path/to/file -DrepositoryId=repositoryId
    -Durl=dav:protocol://path/to/repo -DgroupId=groupId -DartifactId=artifactId
    -Dversion=version -Dpackaging=packageType
