const bunyan = require('bunyan');
const { partial } = require('lodash');
const {
	dynamoOptions,
	serviceName,
	logLevel,
	ProvisionedThroughput
} = require('./data.json');
const dynamo = require('./dynamo');

const logger = bunyan.createLogger({ name: serviceName, level: logLevel });
const instance = dynamo.getInstance(Object.assign({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	logger
}, dynamoOptions));
const docClient = dynamo.getDocClient(dynamoOptions.region);

module.exports = {
	createTable: partial(dynamo.createTable, instance, ProvisionedThroughput),
	dropTable: partial(dynamo.dropTable, instance),
	getAllTables: partial(dynamo.getAllTables, instance),
	upsertItem: partial(dynamo.upsertItem, docClient),
	getItem: partial(dynamo.getItem, docClient)
};
