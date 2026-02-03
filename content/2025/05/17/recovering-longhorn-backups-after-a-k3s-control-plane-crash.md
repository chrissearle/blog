---
title: Recovering longhorn backups after a k3s control-plane crash
date: 2025-05-17 09:20 +0200
tags: [ k3s, longhorn, backup, kubernetes, fluxcd ]
intro: The hard disc on the control-plane died and after rebuilding the cluster I needed to recover longhorn backups - how?
---

I run a little [k3s](https://docs.k3s.io/) cluster on a couple of Raspberry Pi 5s and an old intel nuc at home.

It doesn't run anything too important but it allows me to play with kubernetes and to work with systems that are in
combined intel/arm64 environments.

The cluster was deployed with [fluxcd](https://fluxcd.io/flux/), [longhorn storage](https://longhorn.io/docs) using
local disk, with longhorn backup to a NAS share over CIFS/Samba.

To avoid the pi's eating the SD cards I run them using SSD instead of SD cards.

The SSD on the control-plane pi simply died.

Given that there was no data not in flux apart from longhorn - the backup strategy was the flux repo and the longhorn
backups.

## The rebuild

### Rebuilding the OS

This is simple

- default install of the OS to the SSD (raspian 64 bit no desktop)
- boot - allow system to do first time boot setup
- run ansible - this installs everything on the pi apart from k3s
- edit /boot/firmware/cmdline.txt to add the following to the end of the line (and reboot):

```shell
cgroup_memory=1 cgroup_enable=memory
```

### Installing k3s

Standard - run:

```shell
curl -sfL https://get.k3s.io | sh -
```

On the two agents - run:

```shell
curl -sfL https://get.k3s.io | K3S_URL=https://<IP of control-plane-node>:6443 K3S_TOKEN=<contents of /var/lib/rancher/k3s/server/node-token from control-plane node> sh -
```

Finally - update your local `.kube/config` from `/etc/rancher/k3s/k3s.yaml` on the control-plane node.

### Fluxing

Since my flux setup was experimental - I wanted to tidy it. So - I created a new flux setup follwing the docs on github
bootstrap from fluxcd.

After that - I copied over the parts I wanted to keep - **NOT** including anything that used longhorn storage.

Some other things that were tidied up:

- Separate some kusomizations to allow for dependency ordering - for example - it won't try to install cert-issuer using
  the cert-manager.io/v1 apiVersion before the cert-manager helm chart is installed (since it is this that provides that
  api)
- Replaced the cert-issuer http01 letsencrypt with a dns01 issuer using cloudflare (this allows me to have my internal
  domains also on letsencrypt instead of using a local CA)
- Updated all helm charts and docker images to the latest versions.

### Storage

So to the storage.

At this point - each of the apps that used longhorn storage had a stateful set that used a volume claim template like
this:

```yaml
  volumeClaimTemplates:
    - metadata:
        name: data-volume
      spec:
        accessModes:
          - ReadWriteMany
        storageClass: longhorn
        resources:
          requests:
            storage: 1Gi
```

This will create a longhorn persistent volume and persistent volume claim with default naming.

The PV name will look like `pvc-<GUID>` and the PVC name will look like
`<volumeClaimTemplates.metadata.name>-<metadata.name>-<ID>`.

So - for example - the data-volume in the "share" app stateful set created a PVC called `data-volume-share-0`.

Now - in the longhorn backup list - I could see the backups for each of these volumes.

I was also able to restore them using the longhorn UI - keeping the same names.

However - you need to be able to tell flux to connect to a specific volume rather than generating a new one.

This was simple enough - it required adding two new files to each kustomization. Note that in the following - it ignores
the Capacity - since the volume exists - but I set it in case of a subsequent restore where I don't restore a backup.

One for the PV:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pvc-<CORRECT GUID>
spec:
  capacity:
    storage: <Capacity>
  accessModes:
    - ReadWriteMany
  storageClassName: longhorn
  persistentVolumeReclaimPolicy: Retain
  csi:
    driver: driver.longhorn.io
    volumeHandle: pvc-<CORRECT GUID>
  claimRef:
    namespace: <CORRECT NAMESPACE FOR THE APP>
    name: <CORRECT PVC NAME - for example data-volume-share-0>
```

And one for the PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <CORRECT PVC NAME - for example data-volume-share-0>
  namespace: <CORRECT NAMESPACE FOR THE APP>
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: longhorn
  resources:
    requests:
      storage: <Capacity>
  volumeName: pvc-<CORRECT GUID>
```

No changes were needed in the stateful set or the volume claim template.

**HOWEVER**

If I had installed the entire app then there was a strong chance that the stateful set would create some new storage
while reconciling all of this.

I chose to install each app without the stateful set then once the PV and PVC were in place - added it back to the
kustomization. This avoided having to scale down and up and tidy up etc.

## Other fixes?

One - one of the apps had an update that moved its image from using root user to a non-root user. And the db on the
longhorn image was owned by root.

To fix this - I added a temporary pod to the namespace with this:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug-fix
  namespace: <CORRECT NAMESPACE FOR THE APP>
spec:
  containers:
    - name: shell
      image: busybox
      command: [ "sleep", "3600" ]
      volumeMounts:
        - mountPath: /data
          name: data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: <CORRECT NAME OF THE PVC - for example data-volume-share-0>
  restartPolicy: Never
```

From here I could simply exec shell in and run chown commands on the data volume.

## Conclusion

Mostly smooth. I did get everything back up and running with their original data apart from one app. For some reason -
that had a longhorn backup but it was empty. Most likely my fault - some error in the original configuration.

I learnt a lot about PV and PVC deployment.

Longhorn is very easy to work with.

At various points I also learned to play with debug pods and init containers to help with debugging etc.

GitHub copilot (GPT 4.1 in agent mode) probably reduced the time I spent figuring out the changes to about 1/10th of
what it would have been. Still don't feel replaced yet - it still needs direction :)
  