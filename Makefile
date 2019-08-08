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


.PHONY: all build test release clean help

all: help

build:
	@echo "Building ${API_DOCKER_REPO} image."
	docker build -t ${API_DOCKER_REPO} .
	@echo "Listing ${API_DOCKER_REPO} image."
	docker images

test:
	@echo "Run ${API_DOCKER_REPO} image."
	docker run --name ${API_DOCKER_REPO} -p ${APP_PORT} --env ${MONGODB_URI} -d ${API_DOCKER_REPO} &
	@echo "Wait until ${API_DOCKER_REPO} is fully started."
	sleep 10
	docker logs ${API_DOCKER_REPO}

release:
	@echo "Release ${API_DOCKER_REPO} image to docker registry."
	cat ${DOCKER_PWD} | docker login --username ${DOCKER_USER} --password-stdin
	docker tag  ${API_DOCKER_REPO} ${API_DOCKER_REPO}
	docker push ${API_DOCKER_REPO}

clean:
	@echo ""
	@echo "Cleaning local build environment."
	@echo ""
	docker stop ${API_DOCKER_REPO} 2>/dev/null; true
	docker rm ${API_DOCKER_REPO}  2>/dev/null; true
	@echo ""
	@echo "Purging local images."
	docker rmi ${API_DOCKER_REPO} 2>/dev/null; true

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
