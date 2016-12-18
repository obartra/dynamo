#!/usr/bin/env bash
# Installs the local version of DynamoDB

wget -qO- http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz | tar xvz -C dynamodb
java -Djava.library.path=./dynamodb/DynamoDBLocal_lib -jar ./dynamodb/DynamoDBLocal.jar -sharedDb -delayTransientStatuses -port 8900
