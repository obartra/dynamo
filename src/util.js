const { identity } = require('lodash');

function promisify(async, process = identity) {
	return new Promise((resolve, reject) => {
		function onComplete(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(process(data));
			}
		}
		async(onComplete);
	});
}

function onError(err) {
	console.error(err);
}

module.exports = {
	promisify,
	onError
};
