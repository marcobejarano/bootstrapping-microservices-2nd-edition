set -u
: "$CONTAINER_REGISTRY_URL"
: "$VERSION"

envsubst < scripts/kubernetes/deploy.yaml | kubectl delete -f -
