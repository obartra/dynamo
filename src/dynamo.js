const _ = require('lodash');
const AWS = require('aws-sdk');
const { promisify } = require('./util');

function getInstance(config) {
	return new AWS.DynamoDB(config);
}

function getDocClient(region) {
	return new AWS.DynamoDB.DocumentClient({ region });
}

function getAllTables(instance) {
	return promisify(cb => instance.listTables({}, cb), _.property('TableNames'));
}

function createTable(instance, ProvisionedThroughput, TableName, KeySchema, AttributeDefinitions) {
	const params = { TableName, KeySchema, AttributeDefinitions, ProvisionedThroughput };

	return promisify(cb => instance.createTable(params, cb), _.property('TableDescription'));
}

function dropTable(instance, TableName) {
	return promisify(cb => instance.deleteTable({ TableName }, cb));
}

function upsertItem(docClient, TableName, Item) {
	return promisify(cb => docClient.put({ TableName, Item }, cb));
}

function getItem(docClient, TableName, Key) {
	return promisify(cb => docClient.get({ TableName, Key }, cb));
}

module.exports = {
	getInstance,
	getDocClient,
	createTable,
	dropTable,
	getAllTables,
	upsertItem,
	getItem
};
