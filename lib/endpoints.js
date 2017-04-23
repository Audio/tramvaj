require('date-format-lite')

module.exports = (idosClient) => {
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

	return { findEarliest }
}
