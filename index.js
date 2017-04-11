const api = require('./lib/api')
const config = require('./config')

api.createClient(config.url, config.credentials, (e, apiClient) => {
	if (e) {
		console.log(e)
		return
	}

	const express = require('express')
	const app = express()

	const middleware = require('./lib/api.middleware')(apiClient)
	app.use(middleware.renewSession)
	app.use(middleware.findEarliest)

	app.listen(config.port, () => {
		console.log(`Listening on port ${config.port}`)
	})
})
