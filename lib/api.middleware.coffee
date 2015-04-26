
require 'date-format-lite'
memoize = require 'memoizee'

module.exports = (apiClient) ->

  renewOptions =
    async: yes
    primitive: yes
    maxAge: 1000 * 60 * 60 * 12 # half day in ms

  renewSession: memoize (req, res, next) ->
    apiClient.login next
  , renewOptions

  findEarliest: (req, res, next) ->
    now = new Date
    opts =
      areaId: 'PID' # Prague
      maxResults: 2
      directOnly: yes
      date: now.format 'DD.MM.YYYY'
      time: now.format 'hh:mm'
      isDepartureTime: yes
      from: 'Urxova'
      to: 'Kobylisy'

    apiClient.findEarliest opts, (e, time) ->
      return next e if e
      res.set 'Content-Type', 'text/plain'
      res.send time
      next()
