Write-Output $Env:REGISTRY_PASSWORD | docker login $Env:CONTAINER_REGISTRY_URL --username $Env:REGISTRY_USERNAME --password-stdin
docker push $Env:CONTAINER_REGISTRY_URL/video-streaming:$Env:VERSION
