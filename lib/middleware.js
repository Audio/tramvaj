require('date-format-lite')
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

	const findEarliest = (req, res, next) => {
		let now = new Date()
		let opts = {
			areaId: 'PID', // Prague
			maxResults: 2,
			directOnly: true,
			date: now.format('DD.MM.YYYY'),
			time: now.format('hh:mm'),
			isDepartureTime: true,
			from: 'Urxova',
			to: 'Kobylisy',
		}

		idosClient.findEarliest(opts)
		.then(time => {
			res.set('Content-Type', 'text/plain')
			res.send(time)
		})
		.catch(next)
	}

	return { renewSession, findEarliest }
}
