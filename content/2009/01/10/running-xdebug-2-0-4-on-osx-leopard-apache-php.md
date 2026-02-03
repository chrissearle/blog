---
title: Running xdebug 2.0.4 on OSX Leopard apache/php
date: 2009-01-10 21:36:31 +0100
tags: [mac, osx, leopard, php, xdebug, debug]
---

This is based on the information on [http://developers.sugarcrm.com/wordpress/2008/11/25/enabling-xdebug-under-os-x-leopard/](http://developers.sugarcrm.com/wordpress/2008/11/25/enabling-xdebug-under-os-x-leopard/).
Download xdebug 2.0.4 (or later - but this is based on the 2.0.4 build) - extract it.

    phpize
    MACOSX_DEPLOYMENT_TARGET=10.5 CFLAGS=&quot;-arch ppc -arch ppc64 -arch i386 -arch x86_64 -g -Os \
         -pipe -no-cpp-precomp&quot; CCFLAGS=&quot;-arch ppc -arch ppc64 -arch i386 -arch x86_64 -g -Os -pipe&quot; \
         CXXFLAGS=&quot;-arch ppc -arch ppc64 -arch i386 -arch x86_64 -g -Os -pipe&quot; LDFLAGS=&quot;-arch ppc \
         -arch ppc64 -arch i386 -arch x86_64 -bind_at_load&quot; ./configure --enable-xdebug
    make
    sudo make install

My machine didn't have an existing php.ini - so I changed the next section:

    sudo cp /etc/php.ini.default /etc/apache2/php.ini

Now - add the following to the end of the new php.ini:

    zend_extension=/usr/lib/php/extensions/no-debug-non-zts-20060613/xdebug.so
    xdebug.remote_enable=1
    xdebug.remote_host=localhost
    xdebug.remote_port=9000
    xdebug.remote_autostart=1

Finally - tell apache which php.ini to load - add the following to /etc/apache2/other/php5.conf:

    PHPIniDir /etc/apache2

Finally - restart apache.  For debugging - Eclipse, Komodo or [MacGDBp](http://www.bluestatic.org/software/macgdbp/)
