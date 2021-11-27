TAG = $(shell git describe --tags --always)
PREFIX = localhost:5000/mbszarek
BASE_REPO_NAME = base-image
REPO_NAME = hyperflow-standalone-autoscaler

all: push

container: image

image:
	docker build -t $(PREFIX)/$(REPO_NAME) . # Build new image and automatically tag it as latest
	docker tag $(PREFIX)/$(REPO_NAME) $(PREFIX)/$(REPO_NAME):$(TAG)  # Add the version tag to the latest image

base-image:
	docker build -t $(PREFIX)/$(BASE_REPO_NAME) -f Dockerfile.kubectl .
	docker tag $(PREFIX)/$(BASE_REPO_NAME) $(PREFIX)/$(REPO_NAME):$(TAG)

push: image
	docker push $(PREFIX)/$(REPO_NAME) # Push image tagged as latest to repository
	docker push $(PREFIX)/$(REPO_NAME):$(TAG) # Push version tagged image to repository (since this image is already pushed it will simply create or update version tag)

clean:
