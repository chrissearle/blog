---
title: Backup and restore of Unifi Cloud Key Gen2 Plus
date: 2020-02-22 18:47 +0100
tags: [unifi, unifi controller, unifi protect, unifi cloud key]
intro: After a cloudkey gen2 plus crash - how to get a backup restored when a factory reset installs an older software version.
---

My unifi controller and unifi protect software are running on a Cloud Key Gen2 Plus device.

Today I noticed that it had gone into a fail state - it couldn't see that either were online. Checking them directly - the same - not responding.

So - a reboot - and - hmm - same issue. So it was time to go for a factory reset and restore.

## Restoring the controller

After the factory reset I headed to the controller setup first. I uploaded my backup and got

> The backup file you are trying to load is from a newer
> version of the UniFi Controller and cannot be used with
> this controller.

### Updating the controller version via SSH

First - head to https://www.ui.com/download/unifi/

Get the URL of the latest version of UniFi Network Controller X.X.X for Debian/Ubuntu Linux and UniFi Cloud Key

Now we need to download and install this file.

SSH password: whatever you set up after the reset.

```shell
ssh ubnt@CLOUD_KEY_IP
cd /tmp
wget URL
dpkg -i DOWNLOADED.DEB
rm DOWNLOADED.DEB
```

At this point you should be able to restore via the setup GUI. My restores are quite large and it can take some time.

## Restoring protect

There doesn't seem to be a similar way to update protect when the same issue happens - a backup from a newer version.

The simplest fix for this was:

- Setup a new NVR with the same name as the old one
- Give it a new user
- Start it and login
- Apply any waiting updates
- Restore the backup (via import a backup file)

## Backups

So - this all means that I have to have backups already right? Yes.

Backups for the unifi controller will be on the external hard disk on the gen2+ at `/srv/unifi/data/backup/autobackup/`

Backups for protec will be on the _internal_ disk at `/etc/unifi-protect/backups`

I had set up daily backups for the controller and protect.

I had then created a `backup_to_nas` shell script - ssh to the cloud key and place the script under `/etc/cron.daily`

This will use rsync - so we need rsync installed on the cloud key too:

```shell
apt-get update
apt-get install rsync
```

You'll need an ssh key on the cloud key and its public key needs to be on the nas.

Then the script itself is just two rsync calls

```shell
rsync -qa /etc/unifi-protect/backups/ user@nas-host:/path/to/backup/Unifi/protect/

rsync -qa /srv/unifi/data/backup/autobackup/ user@nas-host:/path/to/backup/Unifi/unifi/
```
