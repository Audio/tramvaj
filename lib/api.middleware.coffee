
require 'date-format-lite'
memoize = require 'memoizee'

exports.createFor = (apiClient) ->

  renewOptions =
    async: yes
    maxAge: 1000 * 60 * 60 * 24 # one day in ms

  renewSession = memoize apiClient.login, renewOptions

  renewSession: (req, res, next) ->
    renewSession next

  findEarliestTime: (req, res, next) ->
    now = new Date
    opts =
      Prague: 'PID'
      maxResults: 1
      directOnly: yes
      date: now.format 'DD.MM.YYYY'
      time: now.format 'hh:mm'
      isDepartureTime: yes
      from: 'Vinohradska Vodarna'
      to: 'Kobylisy'

    apiClient.findEarliestTime opts, (e, time) ->
      return next e if e
      res.set 'Content-Type', 'text/plain'
      res.send time
      next()
