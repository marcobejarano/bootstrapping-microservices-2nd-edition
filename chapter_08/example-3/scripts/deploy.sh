set -u
: "$CONTAINER_REGISTRY_URL"
: "$VERSION"

envsubst < chapter_08/example-3/scripts/kubernetes/deploy.yaml | kubectl apply -f -
