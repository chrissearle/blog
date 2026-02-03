---
title: Adding a new disk with LVM and XFS
date: 2005-05-22 11:41:53 +0200
tags: [linux, lvm2]
---

This machine is a debian sarge install (2.6 kernel). During installation - it was set up with root as ext3, some swap - and the rest of the disk as an lvm area. All partitions within this area are xfs. All the work was done by the debian installer. Now - we have a new disk which I needed to add.

So - since this is an already running box - the debian installer can't really be used - let's use the actual utilities.

All of the required steps are documented [on the LVM HOWTO](http://www.tldp.org/HOWTO/LVM-HOWTO/commontask.html)

First - we need to decide if we are going to use the whole disk or a partition. In this case - the whole disk /dev/hdb. To be able to do this - any existing partition table must be removed

```shell
dd if=/dev/zero of=/dev/hdb bs=1k count=1
blockdev --rereadpt /dev/hdb
```

Not sure if the blockdev command is needed - it worked without for me.

Now - we can create a physical volume on the device

```shell
pvcreate /dev/hdb
```

We want to add this to the existing volume group vg0

```shell
vgextend vg0 /dev/hdb
```

So - let's extend an existing logical volume. For testing we'll try /tmp since the contents are not so important. It's currently 512M - lets double that.

```shell
lvextend -L1G /dev/vg0/tmp
```

And then - xfs needs to be told to use the whole area (one of the reasons for choosing xfs is xfs_growfs - since it can be run on a mounted active directory)

```shell
xfs_growfs /tmp
```

Note - the lvextend command here is told to set the size to 1G - we could have used -L+1G - which would have added 1G to the existing size.

To add a new logical volume newvol to volume group vg0 instead you could use

```shell
lvcreate -L1500 -nnewvol vg0
```
