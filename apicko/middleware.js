module.exports = () => {
	const handleError = (err, req, res, next) => {
		console.error(new Date(), err.message)
		if (err.stack) console.error(err.stack)

		res.set('Content-Type', 'application/json')
		res.send({error: err.message})
	}

	return { handleError }
}
