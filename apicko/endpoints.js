module.exports = (idosService) => {
	const getDepartures = (req, res, next) => {
		if (!req.query.from) return next(new Error("Missing 'from' parameter"))
		if (!req.query.to) return next(new Error("Missing 'to' parameter"))

		const input = {
			from: req.query.from,
			to: req.query.to,
			maxResults: Number(req.query.maxResults) || 2,
		}

		return idosService.getDepartures(input)
		.then(result => {
			res.set('Content-Type', 'application/json')
			res.send({input, result})
		})
		.catch(next)
	}

	return { getDepartures }
}
