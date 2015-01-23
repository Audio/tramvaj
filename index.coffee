
config = require './config'
debug = require('debug') 'tramvaj'
async = require 'async'

async.waterfall [

  (next) ->
    api = require './lib/api'
    url = 'http://ttws.timetable.cz/tt.asmx?WSDL'
    api.createClient url, config.credentials, next

  (apiClient, next) ->
    express = require 'express'
    app = express()

    middlewares = require './lib/api.middleware.coffee'
    middleware = middlewares.createFor apiClient
    app.use middleware.renewSession
    app.use middleware.findEarliestTime

    debug "Listening on port #{config.port}"
    app.listen config.port, next

], (e) -> console.log e if e
