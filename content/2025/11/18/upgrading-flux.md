---
title: Upgrading flux
date: 2025-11-18 11:13 +0100
tags: [k3s, fluxcd, upgrade, kubernetes]
intro: Upgrading flux installs for k3s clusters
---

I have two k3s clusters running - an older cluster running on some raspberry pis at home, and a single node cluster
running on a cloud provider VM.

The home cluster was on 2.5.1 and the cloud one on 2.7.2 - the latest (as of this post) is 2.7.3.

The update procedure for 2.7.3 I took from [this discussion](https://github.com/fluxcd/flux2/discussions/5572) as well
as the [upgrade docs](https://fluxcd.io/flux/installation/upgrade/) and it boils down to:

```shell
git clone <cluster-repo>
cd <cluster-repo>
flux migrate -v 2.6 -f .
git commit -am "Migrate to Flux v2.6 stable APIs"
git push
```

This updated a few things (interestingly on both clusters - even though one was already on 2.7.2 - too much copy/paste
between clusters).

Let it reconcile.

It also said to repeat for 2.7 with `flux migrate -v 2.7 -f .` but that found nothing to update in either cluster.

Next step was to run

```shell
flux migrate
```

Finally - update the bootstrapped info.

Here the upgrade docs show that you can re-run bootstrap:

```shell
flux bootstrap github \
  --owner=github-username \
  --repository=cluster-repo \
  --branch=main \
  --path=clusters/<cluster-name> \
  --personal
```

But - there was a second option - to do so via git:

```shell
git clone <cluster-repo>
cd <cluster-repo>
flux install --export >! ./clusters/<cluster-name>/flux-system/gotk-components.yaml
git add -A && git commit -m "Update to $(flux -v)"
git push
```

I chose the git method - and it worked fine for both.

Finally - you can run

```shell
flux check
```

