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

function onError(logger, err) {
	logger.error(err);
}

function retry(queue, timeout = 0, maxRetries = 10, retryAttempt = 0) {
	if (!queue.length) {
		return Promise.resolve();
	} else if (retryAttempt > maxRetries) {
		return Promise.reject();
	}

	const additionalDelay = 1000;
	const attempt = queue.shift();

	return wait(timeout)
		.then(attempt)
		.then(() => retry(queue, timeout - additionalDelay, maxRetries))
		.catch(() => retry([attempt, ...queue], timeout + additionalDelay, maxRetries, ++retryAttempt));
}

function wait(timeout = 0) {
	timeout = Math.max(0, timeout);
	return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = {
	promisify,
	onError,
	retry,
	wait
};
