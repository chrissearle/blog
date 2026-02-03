---
title: Adding self-signed https certificates to java keystore
date: 2007-10-25 11:57:37 +0200
tags: [java, ssl, maven, keystore, webdav, keytool]
---

There are several reasons you may need to add a self-signed https ssl certificate to your local java keystore.

For me - its so that maven can access DAV shares for repository deployment.

You need to run the following

    $JAVA_HOME/bin/keytool -import -alias <some descriptive name> -file <certificate file> -keystore <path to keystore>

For MAC - keystore is $JAVA_HOME/lib/security/jssecacerts

(and JAVA_HOME on the Mac is /System/Library/Frameworks/JavaVM.framework/Versions/<your version>/Home)

For Windows/Linux - keystore is $JAVA_HOME/jre/lib/security/jssecacerts

Default password is changeit

**Update**

If you need to install someone else's certificate and they don't have a download link then the following from [http://www.madboa.com/geek/openssl/#cert-retrieve](http://www.madboa.com/geek/openssl/#cert-retrieve) may help:

    #!/bin/sh
    #
    # usage: retrieve-cert.sh remote.host.name [port]
    #
    REMHOST=$1
    REMPORT=${2:-443}
    echo |\
    openssl s_client -connect ${REMHOST}:${REMPORT} 2>&1 |\
    sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p'

**Update 2013-11-22**

Mac certificate file path - the path given above matches the JDKs from Apple. The path for the certificate file if you're using java 7 from oracle on your mac will match the path given for windows/linux above - in other words - from java 7 and on - the path is the same for windows/linux/mac (makes sense since the JDK now comes from the same place).
