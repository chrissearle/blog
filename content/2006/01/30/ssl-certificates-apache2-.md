---
title: SSL certificates (apache2)
date: 2006-01-30 21:34:50 +0100
tags: [debian, ssl, apache2]
---

There are two kinds of certificates available - self-certified (free - but people will have to either accept the certificate or manually install it) or paid for (you buy it from a Certificate Authority and as long as that CA is a common one then it will just work in most browsers).

First you will need a private key:

    cd /etc/ssl
    openssl genrsa -des3 -out private/your.domain.tld.key 2048

Drop the -des3 if you don't want a password (this will allow auto-startup of apache - but is much much less secure). Note - if you are going to purchase a certificate - check how many bits the provider wants you to use.

Now - you will need  a certificate signing request (CSR)

    cd /etc/ssl
    openssl req -new -key private/your.domain.tld.key -out certs/your.domain.tld.csr

This will prompt you for X.500 information.

Country, Company, Organizational Unit etc you can set as you need.

Common Name (CN) **must** be the domain you wish to protect. This is a very important point (especially with purchased certificates). It should be the fully qualified domain name. For self-cert you can specify *.domain.tld for a domain wide one (this may well work with purchased certificates but most CAs want to charge per site - rather than per domain).

Note - if you specify just domain.tld then https://domain.tld will work but http://www.domain.tld will not.

This CSR can now be sent to a CA for signing. Once signed - the certificate will be returned to you - stick it in /etc/ssl/certs/your.domain.tld.crt.

You can of course sign your own certificate.  This has the benefit of being free - but the drawback that users will either have to install your certificate manually - or - every time they access the site they will have to approve the use of the certificate.

To sign your own certificate run the following:

    openssl req -new -x509 -key /etc/ssl/private/your.domain.tld.key -out /etc/ssl/certs/your.domain.tld.crt -days &lt;n&gt;

where &lt;n&gt; is the number of days the certificate should be valid for.

Now - we need to install it inside apache2.

    a2enmod ssl

Will enable the module.

Make sure that /etc/apache2/ports.conf includes Listen for port 443.

Now - either in apache2.conf - or in **one** of your virtual host files (make sure that the port in the virtual host file is also 443) add

    SSLEngine On
    SSLCertificateFile /etc/ssl/certs/your.domain.tld.crt
    SSLCertificateKeyFile /etc/ssl/private/your.domain.tld.key

For more info on why **only one** NameVirtualHost virtual host can have SSL on a server (and possible workarounds) - see [http://httpd.apache.org/docs/2.0/ssl/ssl_faq.html#vhosts](http://httpd.apache.org/docs/2.0/ssl/ssl_faq.html#vhosts)
