az aks get-credentials --resource-group flixtube --name flixtube --overwrite-existing
kubectl apply -f scripts/kubernetes/deploy.ps1.yaml
