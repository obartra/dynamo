const _ = require('lodash');
const bunyan = require('bunyan');
const {
	createTable,
	dropTable,
	getAllTables,
	query,
	scan,
	upsertItem
} = require('./db');
const {
	logLevel,
	serviceName
} = require('./data.json');
const { onError } = require('./util');
const allMovies = require('../samples/moviedata.json');

const logger = bunyan.createLogger({ name: `${serviceName}-index`, level: logLevel });

function importMovies() {
	const success = [];
	const errors = [];
	const reasons = [];
	const promises = _.map([allMovies[0]], movie =>
		upsertItem('movies', movie)
			.then(() => {
				success.push(movie.title);
			})
			.catch((err) => {
				reasons.push(err.message);
				errors.push(movie.title);
			})
	);

	return Promise.all(promises).then(() => ({ errors, success, reasons }));
}

function printMovie({ info, year, title }) {
	const maxPlotLength = 50;
	const plot = _.get(info, 'plot', '');
	const plotTxt = plot.length > maxPlotLength ? `${plot.substring(0, maxPlotLength)}...` : plot;

	process.stdout.write(`- ${title} (${year}) ${info.rating}/10 - ${plotTxt}\n`);
}

let start = Promise.resolve();

if (_.includes(process.argv, 'create')) {
	start = getAllTables()
		.then((tables) => {
			if (tables.includes('movies')) {
				logger.info('1. Droping table "movies"');
				return dropTable('movies');
			}
			return Promise.resolve();
		})
		.then(() =>
			createTable('movies', [
				{ AttributeName: 'year', KeyType: 'HASH' }, // Partition key
				{ AttributeName: 'title', KeyType: 'RANGE' } // Sort key
			], [
				{ AttributeName: 'year', AttributeType: 'N' },
				{ AttributeName: 'title', AttributeType: 'S' }
			])
		)
		.then(() => {
			logger.info('2. Movies table created');
		})
		.then(importMovies)
		.then(({ success, errors, reasons }) => {
			if (errors.length) {
				logger.error('added', success.length, 'failed', errors, 'reasons', reasons);
			} else {
				logger.info('3. Movies imported');
			}
		});
}

start
	.then(() =>
		query('movies', '#yr = :yyyy', {
			'#yr': 'year'
		}, {
			':yyyy': 1985
		}, '#yr, title, info.rating, info.plot')
	)
	.then((movies) => {
		logger.info('4. Query 1985 movies');
		movies.forEach(printMovie);
		process.stdout.write('\n');
	})
	.then(() =>
		query('movies', '#yr = :yyyy and title between :letter1 and :letter2', {
			'#yr': 'year'
		}, {
			':yyyy': 1992,
			':letter1': 'A',
			':letter2': 'L'
		}, '#yr, title, info.rating, info.plot')
	)
	.then((movies) => {
		logger.info('4. Query 1992 movies between A-L');
		movies.forEach(printMovie);
		process.stdout.write('\n');
	})
	.then(() =>
		scan('movies', '#yr between :start_yr and :end_yr', {
			'#yr': 'year'
		}, {
			':start_yr': 1950,
			':end_yr': 1959
		}, '#yr, title, info.rating, info.plot')
	)
	.then((movies) => {
		logger.info('4. Scan Movies from 1950-1959');
		movies.forEach(printMovie);
		process.stdout.write('\n');
	})
	.catch(err => onError(logger, err));
