---
title: Moving from dockerhub to github container repository
date: 2025-09-17 08:25 +0200
tags: [ github, docker, dockerhub, container, ghcr ]
intro: Dockerhub is making changes to their base level paid tier which would more than double my monthly cost - and I don't want or use the extra stuff they are adding - so - testing out moving to github's container repository on ghcr.io
---

I've had a minimum cost paid dockerhub subscription for a long while - just to be able to have private repositories.

I received an e-mail bumping that from $5 to $11 a month - and adding a lot of stuff I don't want or need.

So - let's try moving stuff to github's container repository - [ghcr.io](https://ghcr.io/).

## Updating build scripts

### Existing dockerhub setup

All the code was built on github already.

First - dockerhub username and PAT token were added as secrets to the github repository.

Then - the build action looked like this:

```yaml
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to dockerhub
        uses: docker/login-action@v3
        with:
          username: $DOCKERHUB_USERNAME
          password: $DOCKERHUB_TOKEN

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ${{ github.repository_owner }}/<project_name>:latest
```

### Updates to move to ghcr

The changes required to move it to ghcr were minimal - since ghcr is already well integrated with github actions.

First - add permissions so that github can write packages:

```yaml
permissions:
  contents: read
  packages: write
```

Then update the login and build steps: 

```yaml
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ github.token }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/<project_name>:latest
          labels: |
            org.opencontainers.image.source=https://github.com/${{ github.repository }}
```

### Other changes

I did make one other improvement - when tagging a built image with a new tag - I used to do a docker pull, docker tag, docker push.

Now - it's using docker image tools - for example:

```shell
docker buildx imagetools create \
  --tag ghcr.io/${{ github.repository_owner }}/<project_name>:staging \
  ghcr.io/${{ github.repository_owner }}/<project_name>:latest
```

### Tidy up

Finally - I just had to remove the old dockerhub secrets from the repository.

## Pulling images

To pull private images from ghcr.io - you need to create a PAT token with the `read:packages` scope.

### Testing locally

```shell
echo $GHCR_PAT | docker login ghcr.io -u <github-username> --password-stdin
docker pull ghcr.io/<github-username>/<project_name>:latest
```

### Updating ansible

I deploy simple docker images using ansible to some servers.

#### Login

Replace the `dockerhub_password` secret with a `ghcr_pat` secret in the ansible vault.

Then - update the login task:

Old:

```yaml
- name: Login to dockerhub
  community.docker.docker_login:
    username: "{{ dockerhub_username }}"
    password: "{{ dockerhub_password }}"
```

New:

```yaml
- name: Login to GHCR
  community.docker.docker_login:
    registry_url: ghcr.io
    username: "{{ github_username }}"
    password: "{{ ghcr_pat }}"
```

#### Deployment

Simply change the image from `<dockerhub_username>/<project_name>:latest` to `ghcr.io/<github_username>/<project_name>:latest`

### Updating flux

In flux - I have secrets for registry credentials. These are deployed using sealed secrets.

Simple update - first - generate a new version of the secret:

```shell
kubectl create secret docker-registry regcred \
  --namespace <namespace> \
  --docker-server=ghcr.io \
  --docker-username=<github_username> \
  --docker-password='<PAT token with package:read>' \
  --dry-run=client -o yaml > regcred.yaml
```

Then seal it:

```shell
kubeseal --format=yaml -cert=path/to/pub-sealed-secrets.pem  < regcred.yaml > regcred-sealed.yaml
```

Remember _NOT_ to commit the unsealed version.

Then - update the image in the deployment to use `ghcr.io/<github_username>/<project_name>:latest`

