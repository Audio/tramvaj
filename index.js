const idos = require('./lib/idos')
const config = require('./config')

idos.createClient(config.url, config.credentials)
.then(idosClient => {
	const express = require('express')
	const app = express()

	const middleware = require('./lib/api.middleware')(idosClient)
	app.use(middleware.renewSession)
	app.use(middleware.findEarliest)

	app.listen(config.port, () => {
		console.log(`Listening on port ${config.port}`)
	})
})
.catch(console.error)
