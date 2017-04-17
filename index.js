const api = require('./lib/api')
const config = require('./config')

api.createClient(config.url, config.credentials)
.then(apiClient => {
	const express = require('express')
	const app = express()

	const middleware = require('./lib/api.middleware')(apiClient)
	app.use(middleware.renewSession)
	app.use(middleware.findEarliest)

	app.listen(config.port, () => {
		console.log(`Listening on port ${config.port}`)
	})
})
.catch(console.error)
