---
title: Apache2, NameVirtualHosts, SSL and SERVER_PORT
date: 2008-02-29 22:53:22 +0100
tags: [ssl, apache2, namevirtualhost, php]
---

I was experiencing odd things integrating to google maps - although I have both an API key for http and https - only https was working.

It turns out that the setting of the apache environment variable SERVER_PORT was *always* 443 irrespective of whether I was using http/80 or https/443 from the client.

I have several NameVirtualHosts on different IPs.

In apache2.conf:

    NameVirtualHost 78.47.168.122:80
    NameVirtualHost 78.47.168.123:80
    NameVirtualHost 78.47.168.124:80
    NameVirtualHost 78.47.168.124:443
    NameVirtualHost 78.47.168.125:80
    NameVirtualHost 78.47.168.125:443
    NameVirtualHost 78.47.168.126:80
    NameVirtualHost 78.47.168.126:443

    # Include the virtual host configurations:
    Include /etc/apache2/sites-enabled/

And in one of my more complex virtual files I had the following:

    <VirtualHost 78.47.168.125:80 78.47.168.125:443>

This was making the site available under both http and https - and for https only functions I was using the SSLRequireSSL statement.

But - by using the following test code (thanks once again to Steve Kemp of www.debian-administration.org):

    #!/usr/bin/perl
    print "Content-Type: text/plain\n\n";

    foreach my $key ( sort keys %ENV )
    {
        print "Key $key " . $ENV{$key} . "\n";
    }

I could show that SERVER_PORT was not correct when accessing via HTTP on port 80.

By changing that single virtual host config to have two &lt;VirtualHost&gt; sections - one for each port - this issue goes away. However - I do end up with duplicated config:

    <VirtualHost 78.47.168.125:80>
      HTTP only site config here
    </VirtualHost>
    <VirtualHost 78.47.168.125:443>
      Complete site config here (all the ssl stuff plus a duplicate of the http stuff above)
    >/VirtualHost>
