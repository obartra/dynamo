const _ = require('lodash');
const {
	getInstance,
	getDocClient,
	getAllTables,
	createTable,
	dropTable,
	upsertItem
} = require('./db');
const { onError } = require('./util');
const allMovies = require('../samples/moviedata.json');

getAllTables()
	.then(([table]) => {
		const item = {};
		console.log('table', table);
	})
	.catch(onError);

// createTable('movies', [
// 	{ AttributeName: 'year', KeyType: 'HASH' }, // Partition key
// 	{ AttributeName: 'title', KeyType: 'RANGE' } // Sort key
// ], [
// 	{ AttributeName: 'year', AttributeType: 'N' },
// 	{ AttributeName: 'title', AttributeType: 'S' }
// ]).then((resp) => {
// 	console.log('table created', resp);
// }).catch(onError);

function importMovies() {
	const success = [];
	const errors = [];
	const reasons = [];
	const promises = _.map(allMovies, movie =>
		upsertItem('movies', movie)
			.then(() => {
				success.push(movie.title);
				process.stdout.write('.');
			})
			.catch((err) => {
				reasons.push(err.message);
				errors.push(movie.title);
				process.stdout.write('*');
			})
	);

	return Promise.all(promises).then(() => ({ errors, success, reasons }));
}

// importMovies()
// 	.then(({ success, errors, reasons }) => {
// 		console.log('added', success, 'failed', errors, 'reasons', reasons);
// 	})
// 	.catch(onError);

// dropTable('movies')
// 	.then((resp) => {
// 		console.log('all good', resp);
// 	})
// 	.catch(onError);
