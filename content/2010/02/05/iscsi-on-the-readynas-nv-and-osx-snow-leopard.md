---
title: iSCSI on the ReadyNAS NV+ and OSX Snow Leopard
date: 2010-02-05 09:34:41 +0100
tags: [linux, mac, osx, network attached storage, readynas, snow leopard, iscsi]
---

The Pro series of NAS from ReadyNAS (Netgear) support iSCSI out of the box. But the NV+ 4disk unit does not. However - a [third party plugin is available](http://readynasfreeware.org/projects/nas-iscsi-target).

## Target

The provides support for the iSCSI target on the NAS itself.

There is a fairly good guide [available on the wiki](http://readynasfreeware.org/projects/nas-iscsi-target/wiki/New_Version) at readynasfreeware. 

In short - it's:

1. Upload the bin for the plugin
2. Place a config file on the unit (root ssh required)
3. Create a file (it also supports partitions etc) to contain the disk image
3. Add startup/shutdown links
4. Start the service.

I followed the wiki with only a couple of changes.

In the ietd.conf file - the line:

    Target iqn.2001-04.com.example:readyduo.iscsi.target0

The format is iqn.YYYY-mm.tld.reverse.domain.name:descriptive.string.

The dd command (I created a 500Gb file) took 5 hours - don't do this if you're in a hurry ;)

And at the end - when it asks you to start I kept getting "failed". Turns out the install starts it unconfigured. All I had to do was a 

    /etc/init.d/rfw-iscsi-target stop

before running the start.

## Initiator

For a client to connect to an iSCSI target it needs an initiator.

ReadyNAS has a page that shows how to install and configure [globalSAN's free iSCSI initiator](http://www.readynas.com/?page_id=815). It *will* require a restart of the mac. I grabbed the beta as it said it supported snow leopard. It has a few changes in layout - but the process is the same:

1. Add Portal pointing at the NAS
2. Add a target from the list on that portal.

I was then able to format the newly initiated drive and mount it read/write.

## Speed tests

For this - I copied a 192Mb file back and forward. These are just for fun - highly unscientific - nothing done to check for caching etc, or other busy devices on the network.

<table class="table table-striped">
  <tr>
    <td rowspan="2">Device</td>
    <td colspan="2">Time taken</td>
  </tr>
  <tr>
    <td>to device</td>
    <td>from device</td>
  </tr>
  <tr>
    <td>Drobo FW 800</td>
    <td>8 s</td>
    <td>2 s</td>
  </tr>
  <tr>
    <td>ReadyNAS NV+ iSCSI</td>
    <td>16 s</td>
    <td>4 s</td>
  </tr>
  <tr>
    <td>ReadyNAS NV+ AFP</td>
    <td>10 s</td>
    <td>3 s</td>
  </tr>
  <tr>
    <td>ReadyNAS NV+ SSH (scp as root)</td>
    <td>2 min 4 s</td>
    <td>2 min 2 s</td>
  </tr>
</table>

## Conclusion

Well it works - but it's not a world speed revolution ;)
