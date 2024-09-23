set -u
: "$CONTAINER_REGISTRY_URL"
: "$VERSION"

docker build -t $CONTAINER_REGISTRY_URL/video-streaming:$VERSION -f chapter_08/example-3/Dockerfile.prod chapter_08/example-3/
