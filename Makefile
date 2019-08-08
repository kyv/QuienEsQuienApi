#
# Makefile for QuienEsQuienApi on docker
#
# author: Jorge Armando Medina
# desc: Script to build, test and releaes the QuienEsQuienApi docker image.

include /var/lib/jenkins/.env
include /var/lib/jenkins/apps_data

# DOCKER IMAGE ENV VARS
APP_PORT = 8085:8080
MONGO_URL = localhost:27017
MONGO_DB = dbname
MONGODB_URI = MONGODB_URI=${MONGO_URL}/${MONGO_DB}
IMAGE_NAME = ${API_DOCKER_REPO}
#IMAGE_NAME = ${API_ORG_NAME}/${APP_NAME}:${APP_VERSION}


.PHONY: all build test release clean help

all: help

build:
	@echo "Building ${IMAGE_NAME} image."
	docker build -t ${IMAGE_NAME} .
	@echo "Listing ${IMAGE_NAME} image."
	docker images

test:
	@echo "Run ${IMAGE_NAME} image."
	docker run --name ${API_APP_NAME} -p ${APP_PORT} --env ${MONGODB_URI} -d ${IMAGE_NAME} &
	@echo "Wait until ${API_APP_NAME} is fully started."
	sleep 10
	docker logs ${API_APP_NAME}

release:
	@echo "Release ${IMAGE_NAME} image to docker registry."
	cat ${DOCKER_PWD} | docker login --username ${DOCKER_USER} --password-stdin
	docker tag  ${API_VERSION} ${API_DOCKER_REPO}
	docker push ${API_DOCKER_REPO}

	#docker tag  ${IMAGE_NAME} ${DOCKER_REPO}/:${APP_NAME}-${APP_VERSION}
	#docker push ${DOCKER_REPO}:${APP_NAME}-${APP_VERSION}

clean:
	@echo ""
	@echo "Cleaning local build environment."
	@echo ""
	docker stop ${API_APP_NAME} 2>/dev/null; true
	docker rm ${API_APP_NAME}  2>/dev/null; true
	@echo ""
	@echo "Purging local images."
	docker rmi ${IMAGE_NAME} 2>/dev/null; true

help:
	@echo ""
	@echo "Please use \`make <target>' where <target> is one of"
	@echo ""
	@echo "  build		Builds the docker image."
	@echo "  test		Tests image."
	@echo "  release	Releases image."
	@echo "  clean		Cleans local images."
	@echo ""
	@echo ""
