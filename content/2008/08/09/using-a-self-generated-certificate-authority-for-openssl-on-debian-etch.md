---
title: Using a self-generated Certificate Authority for OpenSSL on debian etch
date: 2008-08-09 09:40:47 +0200
tags: [debian, ssl, openssl, ca.pl]
---

I've been using self-signed certificates for a while - but - that means getting the users to approve them each time they change. Instead - lets generate a Certificate Authority (CA) certificate with a reasonably long life - get them to install that and then new certificates signed with that will be valid for them.

We will install a CA area on /etc/ssl/ca and then create a certificate signed with this.

###Setup

We're going to use the script CA.pl which on debian is installed on /usr/lib/ssl/misc. But - we need to make some changes

First - in CA.pl itself - change the variables near the top for DAYS (default certificate length) and CADAYS (default CA certificate length). By default they are for 1 and 3 years - I went with 10 and 15 - since I'm lazy :)

    $DAYS="-days 3650";     # 10 years
    $CADAYS="-days 5475";   # 15 years

The CA.pl script makes everything in paths relative to your current working directory. This is fine for new certificates, requests etc - but not for the CA files themselves. Find and change

    $CATOP="demoCA";

to

    $CATOP="/etc/ssl/ca";

One more change - the default CA certificates key is 1024 bits RSA. I would like 2048. So - search down to <code>  print "Making CA certificate ...\n";</code>. The line after that needs changing from

    system ("$REQ -new -keyout " .

to

    system ("$REQ -newkey rsa:2048 -keyout " .

Finally - we need to match changes in /etc/ssl/openssl.cnf

    dir = ./demoCA

to

    dir = /etc/ssl/ca

And

    default_days    = 365

to

    default_days    = 3650

You can also if you wish change the default certificate parts (country, section etc) lower down in this file. You'll be able to overwrite each entry at certificate creation time - but this allows you to set useful defaults.

###Generate the CA

Run the following:

    /usr/lib/ssl/misc/CA.pl -newca

*  Press return for the CA certificate file name.
*  It will ask for A PEM pass phrase - choose a good one - this protects your CA certificate's key.
*  It will ask for certificate details (country etc) - enter whatever is appropriate for you.
*  It will then try to create the certificate with the newly signed key (using the openssl.cnf config) - you will have to give the password you entered above.

Your new cacert.pem file is now in /etc/ssl/ca/cacert.pem and can be distributed for installation in browsers etc.

###Create a PKCS12 version of the certificate

Some systems want the certificate in pkcs12 format:

From the /etc/ssl/ca directory run

    openssl pkcs12 -export -in cacert.pem -inkey private/cakey.pem -out cacert.p12

Opera will not accept this - it believes that both the key and the certificate in this file should be encrypted. I'm still working on this one - at present I've used:

    openssl pkcs12 -export -in cacert.pem -inkey private/cakey.pem -descert -out cacert.des.p12

And Opera will at least import it - but - it places it in the Personal Client certificate list instead of the Authorities tab - despite being on the Authorities tab on import. I will update this if I find out what needs to be done.

More info on [http://my.opera.com/community/forums/topic.dml?id=245482](http://my.opera.com/community/forums/topic.dml?id=245482)

###Generating certificates

This goes through the following process:

1.  Generate a certificate request
1.  Send this for signing
1.  Receive the signed certificate
1.  Install it

Of course - as your own CA you will be sending it to yourself and signing it yourself.

####Generating a certificate request

    /usr/lib/ssl/misc/CA.pl -newreq

This will prompt you for the certificate details. The *vital* point is that the CN of the certificate *must* be the domain name of the site you wish to secure. You can use *.example.com for a wildcard certificate (everything under example.com).

This will generate a newkey.pem and a newreq.pem. newkey.pem you need to keep for later - newreq.pem you would send off for signing - in this case to yourself - but you could also use it for purchasing a real certificate.

####Signing a certificate request

Given a newreq.pem in the current working directory run

    /usr/lib/ssl/misc/CA.pl -sign

This will sign the request and generate a newcert.pem with the signed certificate.

####Installing the certificates

The installation will depend on what software you are using. You will need the newkey.pem and newcert.pem - rename them to something useful - like domainname.key and domainname.cert.

Some software will not accept the extra information in the certificate file - you can strip out everything apart from the lines "-----BEGIN CERTIFICATE-----" up to and including "-----END CERTIFICATE-----".

Note - your key has a passphrase assigned during the -newreq phase. If you want your software to autostart this won't work - since it prompts for the password. To remove a passphrase:

    openssl rsa -in newkey.pem -out newkey.nopass.pem

This will prompt you one last time and then generate a non-passphrase key file that you can use instead.
