const express = require('express')
const idos = require('./lib/idos')
const config = require('./config')

const app = express()

idos.createClient(config.url, config.credentials)
.then(idosClient => {
	const middleware = require('./lib/middleware')(idosClient)
	const endpoints = require('./lib/endpoints')(idosClient)
	app.use('/api', middleware.renewSession)
	app.get('/api/search', endpoints.getDepartures)
	app.use(middleware.handleError)

	app.listen(config.port, () => {
		console.log(`Listening on port ${config.port}`)
	})
})
.catch(console.error)
