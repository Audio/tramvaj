require('date-format-lite')
const memoize = require('memoizee')

module.exports = (apiClient) => {
	let renewOptions = {
		async: true,
		primitive: true,
		maxAge: 1000 * 60 * 60 * 12, // half day in ms
	}

	const renewSession = memoize(
		(req, res, next) => {
			apiClient.login(next)
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

		apiClient.findEarliest(opts, (e, time) => {
			if (e) return next(e)
			res.set('Content-Type', 'text/plain')
			res.send(time)
			return next()
		})
	}

	return { renewSession, findEarliest }
}
