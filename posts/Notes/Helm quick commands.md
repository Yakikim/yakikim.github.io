---
tags: helm, devops, commands
---
# Helm
[[index | דף הבית]]/[[אחר]] 

----
[[2021-04-25]]

## Common Commands

Add repo
```
helm repo add stable https://charts.helm.sh/stable
```

Updating repo. sync all helm charts info.
```
helm repo update
```

show you a list of all deployed releases.
```
helm list
```


setup helm with our cluster.
```bash
 helm init
```

```bash
helm repo update 
```

By default helm uses stable repo, we can see
which repos are available using list.
```bash
helm repo list 
```

Create a chart
```bash
helm create <chart name> 
$ helm package <chart name> - package a chart into tar.gz
```

install a chart
```bash
helm install <name> <chart>
```

delete a chart
```bash
helm delete <chart name> 
```

[[YakisSite/ChertMuseum]] install as docker container
```bash
docker run --rm -it \
   -p 8080:8080 \
   -e DEBUG=1 \
   -e STORAGE=local \
   -e STORAGE_LOCAL_ROOTDIR=/charts \
   -v $(pwd)/charts:/charts \
   ghcr.io/helm/chartmuseum:v0.13.1
```
