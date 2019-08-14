#!/bin/bash

source /var/lib/jenkins/.env

API_ORG_NAME=quienesquienapi
API_APP_NAME=quienesquienapi
API_VERSION=$(cat package.json | jq -r .version)
API_DOCKER_REPO=${DOCKER_REPO}/${API_ORG_NAME}:${API_VERSION}
APPS_DATA_FILE=/var/lib/jenkins/apps_data

[[ ! -f "$APPS_DATA_FILE" ]] && touch $APPS_DATA_FILE
chown jenkins:jenkins $APPS_DATA_FILE;

sed -i \
 -e '/^API_VERSION/ d'  \
 -e '/^API_ORG_NAME/ d' \
 -e '/^API_APP_NAME/ d' \
 -e '/^API_DOCKER_REPO/ d' \
$APPS_DATA_FILE
echo "API_VERSION=$API_VERSION" >> $APPS_DATA_FILE
echo "API_ORG_NAME=$API_ORG_NAME" >> $APPS_DATA_FILE
echo "API_APP_NAME=$API_APP_NAME" >> $APPS_DATA_FILE
echo "API_DOCKER_REPO=$API_DOCKER_REPO" >> $APPS_DATA_FILE