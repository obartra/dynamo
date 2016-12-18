const _ = require('lodash');
const AWS = require('aws-sdk');
const { promisify, retry, wait } = require('./util');

function getInstance(config) {
	return new AWS.DynamoDB(config);
}

function getDocClient(region) {
	return new AWS.DynamoDB.DocumentClient({ region });
}

function getAllTables(instance) {
	return promisify(cb => instance.listTables({}, cb))
		.then(_.property('TableNames'));
}

function createTable(instance, ProvisionedThroughput, TableName, KeySchema, AttributeDefinitions) {
	const params = { TableName, KeySchema, AttributeDefinitions, ProvisionedThroughput };

	return promisify(cb => instance.createTable(params, cb))
		.then(() => waitForTableStatus(instance, TableName));
}

function waitForTableStatus(instance, TableName, desiredStatus = 'ACTIVE', maxWait = 5000, currentWait = 0) {
	const start = new Date().getTime();

	return getTableStatus(instance, TableName)
		.then((currentStatus) => {
			if (currentStatus === desiredStatus) {
				return desiredStatus;
			}
			currentWait += new Date().getTime() - start;
			if (currentWait < maxWait) {
				return wait(1000)
					.then(() => waitForTableStatus(instance, TableName, desiredStatus, maxWait, currentWait));
			}
			throw new Error('timed out');
		});
}

function getTableStatus(instance, TableName) {
	return promisify(cb => instance.describeTable({ TableName }, cb))
		.then(_.property('Table'))
		.then(_.property('TableStatus'))
		.catch((err) => {
			if (err.name === 'ResourceNotFoundException') {
				return 'DELETED';
			}
			return 'ERROR';
		});
}

function dropTable(instance, TableName) {
	return promisify(cb => instance.deleteTable({ TableName }, cb))
			.then(() => waitForTableStatus(instance, TableName, 'DELETED'));
}

const upsertQueue = [];
let upsertPromise;

function upsertItem(docClient, TableName, Item) {
	const fn = () => promisify(cb => docClient.put({ TableName, Item }, cb))
		.then(() => {
			process.stdout.write('.');
		})
		.catch((error) => {
			process.stdout.write('*');
			throw new Error(error);
		});

	upsertQueue.push(fn);

	if (!upsertPromise) {
		upsertPromise = retry(upsertQueue)
			.then((input) => {
				upsertPromise = null;
				return input;
			});
	}

	return upsertPromise;
}

function getItem(docClient, TableName, Key) {
	return promisify(cb => docClient.get({ TableName, Key }, cb));
}

function query(docClient, TableName, keyCondition, attributeNames, attributeValues, projection = '') {
	const params = {
		TableName,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: attributeNames,
		ExpressionAttributeValues: attributeValues,
		ProjectionExpression: projection
	};

	return promisify(cb => docClient.query(params, cb))
		.then(_.property('Items'));
}

function scan(docClient, TableName, filter, attributeNames, attributeValues, projection = '') {
	const params = {
		TableName,
		FilterExpression: filter,
		ExpressionAttributeNames: attributeNames,
		ExpressionAttributeValues: attributeValues,
		ProjectionExpression: projection
	};

	return promisify(cb => docClient.scan(params, cb))
		.then(_.property('Items'));
}

module.exports = {
	getInstance,
	getDocClient,
	createTable,
	dropTable,
	getAllTables,
	upsertItem,
	getTableStatus,
	getItem,
	query,
	scan
};
