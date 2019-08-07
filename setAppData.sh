#!/bin/bash

API_ORG_NAME=poder
API_APP_NAME=quienesquienapi
API_VERSION=$(cat package.json | jq -r .version)
API_VERSION=/var/lib/jenkins/apps_data

[[ ! -f "$APPS_DATA" ]] && touch $APPS_DATA
chown jenkins:jenkins $APPS_DATA;

sed -i \
 -e '/^API_VERSION/ d'  \
 -e '/^API_ORG_NAME/ d' \
 -e '/^API_APP_NAME/ d' \
$APPS_DATA
echo "API_VERSION=$API_VERSION" >> $APPS_DATA
echo "API_ORG_NAME=$API_ORG_NAME" >> $APPS_DATA
echo "API_APP_NAME=$API_APP_NAME" >> $APPS_DATA
