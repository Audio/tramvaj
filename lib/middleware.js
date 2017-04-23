const memoize = require('memoizee')

module.exports = (idosClient) => {
	let renewOptions = {
		async: true,
		primitive: true,
		maxAge: 1000 * 60 * 60 * 12, // half day in ms
	}

	const renewSession = memoize(
		(req, res, next) => {
			idosClient.login()
			.then(next)
			.catch(next)
		}
	, renewOptions)

	const handleError = (err, req, res, next) => {
		console.error(new Date(), err.message)
		if (err.stack) console.error(err.stack)

		res.set('Content-Type', 'application/json')
		res.send({error: err.message})
	}

	return { handleError, renewSession }
}
