---
title: Owncloud on docker on Synology NAS behind nginx proxy
date: 2019-07-14 14:59 +0200
tags: [nginx, docker, synology, owncloud]
intro: I thought that it would be interesting to run up an instance of owncloud on docker. I have several machines I could put this on - but - if I were to use it as a larger server then I want the bigger disk of the NAS.
---

I thought that it would be interesting to run up an instance of owncloud on docker. I have several machines I could put this on - but - if I were to use it as a larger server then I want the bigger disk of the NAS.

The docker GUI on the DSM software on the NAS is restricted - so we're working on the command line here.

We'll install the owncloud/server docker image - the readme is here: https://github.com/owncloud-docker/server

I used the suggestions on that readme - but found I had the error message that is discussed on this github issue: https://github.com/owncloud-docker/server/issues/35

    General error: 1036 Table '/tmp/#some_name.MAI' is read only

However on that issue they state that plain MariaDB image seems to work where the webhippie/mariadb image does not. Things to note:

- the MariaDB image uses some different environment variables
- I configured the mail client at this point - using gmail
- I added the sub_url setting so that it would be easier to keep track of when doing the nginx proxy

```shell
docker volume create owncloud_redis

docker run -d \
  --name redis \
  -e REDIS_DATABASES=1 \
  --volume owncloud_redis:/var/lib/redis \
  webhippie/redis:latest

docker volume create owncloud_mysql
docker volume create owncloud_backup

docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=owncloud \
  -e MYSQL_USER=owncloud \
  -e MYSQL_PASSWORD=owncloud \
  -e MYSQL_DATABASE=owncloud \
  --volume owncloud_mysql:/var/lib/mysql \
  --volume owncloud_backup:/var/lib/backup \
  mariadb:latest

export OWNCLOUD_VERSION=10.2.1
export OWNCLOUD_DOMAIN=localhost
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=not_telling_you
export HTTP_PORT=5999

docker volume create owncloud_files

docker run -d \
  --name owncloud \
  --link mariadb:db \
  --link redis:redis \
  -p ${HTTP_PORT}:8080 \
  -e OWNCLOUD_DOMAIN=${OWNCLOUD_DOMAIN} \
  -e OWNCLOUD_DB_TYPE=mysql \
  -e OWNCLOUD_DB_NAME=owncloud \
  -e OWNCLOUD_DB_USERNAME=owncloud \
  -e OWNCLOUD_DB_PASSWORD=owncloud \
  -e OWNCLOUD_DB_HOST=db \
  -e OWNCLOUD_ADMIN_USERNAME=${ADMIN_USERNAME} \
  -e OWNCLOUD_ADMIN_PASSWORD=${ADMIN_PASSWORD} \
  -e OWNCLOUD_REDIS_ENABLED=true \
  -e OWNCLOUD_REDIS_HOST=redis \
  -e OWNCLOUD_SUB_URL=/owncloud \
  -e OWNCLOUD_MAIL_DOMAIN=my_email_domain \
  -e OWNCLOUD_MAIL_FROM_ADDRESS=my_email_user \
  -e OWNCLOUD_MAIL_SMTP_AUTH=true \
  -e OWNCLOUD_MAIL_SMTP_AUTH_TYPE=LOGIN \
  -e OWNCLOUD_MAIL_SMTP_HOST=smtp.gmail.com \
  -e OWNCLOUD_MAIL_SMTP_MODE=smtp \
  -e OWNCLOUD_MAIL_SMTP_NAME=my_email_address \
  -e OWNCLOUD_MAIL_SMTP_PASSWORD=an_app_specific_password_for_my_email_address \
  -e OWNCLOUD_MAIL_SMTP_PORT=465 \
  -e OWNCLOUD_MAIL_SMTP_SECURE=ssl \
  --volume owncloud_files:/mnt/data \
  owncloud/server:${OWNCLOUD_VERSION}
```

Note that at this point we're able to hit port 5999 using HTTP and logon. However - I already have an nginx instance running - with letsencrypt certificate support all in place. So we'll put it behind nginx in a reverse proxy setup.

```
    location /owncloud {
        proxy_set_header X-Forwarded-Host $host:$server_port;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://NAS_IP:5999/owncloud;
        proxy_buffering off;
        client_max_body_size 20G;
    }
```

The proxy_buffering was mentioned on the owncloud documentation on large file support and the max size is also needed in the owncloud web config - the default max body size for this image seems to be 513mb.

This means we need to make one more change - and annoyingly - it's inside the owncloud container. We need to update .htaccess and .user.ini to have the max size change too. I am not sure if it needs to be in both - but it keeps it consistent.

Shell in to the docker container:

    docker exec -it owncloud /bin/bash

Now - in .htaccess - find these two lines and change the values:

    php_value upload_max_filesize 20G
    php_value post_max_size 20G

I found a config for PHP5 and one for PHP7. I just updated both.

Similarly in .user.ini - these two lines:

    upload_max_filesize=20G
    post_max_size=20G

This means that whatever apache/php combination the container is using - it should all be good.

This last step is annoying - it will need to be done every time we pull an updated container. We can either live with that, pull out the two files as single file volume mounts - or see if it can get added as an environment setting later on. I need a little more time using owncloud before I start digging in to the repo for that :)

overwritecli
overwritehost
overwriteprotocol
