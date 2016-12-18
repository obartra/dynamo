const bunyan = require('bunyan');
const { partial } = require('lodash');
const {
	dynamoOptions,
	serviceName,
	logLevel,
	localDynamoOptions,
	ProvisionedThroughput
} = require('./data.json');
const dynamo = require('./dynamo');

const isLocal = process.argv.includes('local');
const logger = bunyan.createLogger({ name: `${serviceName}-awssdk`, level: logLevel });
const instance = dynamo.getInstance(Object.assign({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	logger,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}, isLocal ? localDynamoOptions : dynamoOptions));
const docClient = dynamo.getDocClient(dynamoOptions.region);

module.exports = {
	createTable: partial(dynamo.createTable, instance, ProvisionedThroughput),
	dropTable: partial(dynamo.dropTable, instance),
	getAllTables: partial(dynamo.getAllTables, instance),
	upsertItem: partial(dynamo.upsertItem, docClient),
	getItem: partial(dynamo.getItem, docClient),
	getTableStatus: partial(dynamo.getTableStatus, instance),
	query: partial(dynamo.query, docClient),
	scan: partial(dynamo.scan, docClient)
};
