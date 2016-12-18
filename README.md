[![Code Climate](https://codeclimate.com/github/obartra/dynamo/badges/gpa.svg)](https://codeclimate.com/github/obartra/dynamo)
[![Issue Count](https://codeclimate.com/github/obartra/dynamo/badges/issue_count.svg)](https://codeclimate.com/github/obartra/dynamo)
[![CircleCI](https://circleci.com/gh/obartra/dynamo/tree/master.svg?style=shield)](https://circleci.com/gh/obartra/dynamo/tree/master)

# DynamoDB test app

🤾 Playing with DynamoDB

# Install

```shell
$ npm install
```

To use the local version of DynamoDB run:

```shell
$ ./scripts/local-install.sh
```

If using the remote version of DynamoDB (default) you will need `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` defined in your environment. For convenience, you could create a script like the one below that would make sure they are available:

```shell
 #!/bin/sh

export AWS_ACCESS_KEY_ID='accessKeyId'
export AWS_SECRET_ACCESS_KEY='secretAccessKeyId'
```

# Start

```shell
$ npm start
```

You can pass several parameters to start:

- `create`: Deletes the movie table if it exists and re-populates it
- `local`: Uses the local version of DynamoDB instead

To use these parameters you would call `start` like this:

```shell
$ npm start -- create local
```

# Useful Links

- [Local Setup](http://eng.hakopako.net/entry/2016/08/01/100000)
- [Local Testing](http://josephmr.com/dynamodb-testing-locally-with-node/)
- [DynamoDB Limits](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html)
- [Query and Scan](https://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.NodeJs.04.html)
- [Attribute Names and Values](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ExpressionPlaceholders.html#ExpressionAttributeNames)
