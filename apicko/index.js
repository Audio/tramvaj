const config = require('./config')
const express = require('express')
const idosService = require('./idos-service')

const app = express()

const middleware = require('./middleware')()
const endpoints = require('./endpoints')(idosService)

app.get('/api/search', endpoints.getDepartures)
app.use(middleware.handleError)

app.listen(config.port, () => {
	console.log(`Listening on port ${config.port}`)
})
