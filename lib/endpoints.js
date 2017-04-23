require('date-format-lite')

module.exports = (idosClient) => {
	const getDepartures = (req, res, next) => {
		if (!req.query.from) return next(new Error("Missing 'from' parameter"))
		if (!req.query.to) return next(new Error("Missing 'to' parameter"))

		let now = new Date()
		let input = {
			areaId: 'PID', // Prague
			maxResults: Number(req.query.maxResults) || 2,
			directOnly: true,
			date: now.format('DD.MM.YYYY'),
			time: now.format('hh:mm'),
			isDepartureTime: true,
			from: req.query.from,
			to: req.query.to,
		}

		return idosClient.getDepartures(input)
		.then(result => {
			res.set('Content-Type', 'application/json')
			res.send({input, result})
		})
		.catch(next)
	}

	return { getDepartures }
}
