
api = require './lib/api'
config = require './config'

api.createClient config.url, config.credentials, (e, apiClient) ->
    return console.log e if e

    express = require 'express'
    app = express()

    middleware = require('./lib/api.middleware.coffee') apiClient
    app.use middleware.renewSession
    app.use middleware.findEarliest

    app.listen config.port, -> console.log "Listening on port #{config.port}"
