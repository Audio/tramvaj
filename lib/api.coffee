
debug = require('debug') 'tramvaj'
soap = require 'soap'

exports.createClient = (url, credentials, next) ->
  soap.createClient url, (e, client) ->
        return next e if e
        next null, createApiClient(client, credentials)

createApiClient = (soapClient, credentials) ->
  sessionId = null

  parseErr = (body) ->
    body.match(/<faultstring>(.+)<\/faultstring>/)?[1] or 'Unknown error'

  login: (next) ->
    soapClient.Login
      sUserName: credentials.name
      sPassword: credentials.pass
    , (e, r) ->
      return next "Login error: #{parseErr e.body}" if e?.body
      return next e if e
      return next 'Login error: Missing session id' unless sessionId = r?.LoginResult?.sSessionID
      debug "Login successful. Got session id #{sessionId}"
      next()

  findEarliest: (opts, next) ->
    query =
      sSessionID: sessionId
      sCombID: opts.areaId
      iMaxCount: opts.maxResults
      sDate: opts.date
      sTime: opts.time
      iAlgorithm: Number(!opts.directOnly)
      bIsDepTime: opts.isDepartureTime
      aoFrom:
        VirtListItemInfo:
          attributes:
            sName: opts.from
      aoTo:
        VirtListItemInfo:
          attributes:
            sName: opts.to

    debug "Finding earliest time since #{opts.time}, #{opts.date}"
    soapClient.Connection2 query, (e, r) ->
      return next "Find error: #{parseErr e.body}" if e?.body
      return next e if e
      trains = r?.Connection2Result?.oConnInfo?.aoConnections?[0]?.aoTrains?[0]
      times = []
      for i in [0...opts.maxResults]
        time = trains?.aoRoute?[i]?.attributes?.sDepTime
        times.push time if time
      return next 'Find error: no earliest time recognized' unless times.length
      debug "Result: #{times}"
      next null, times.join(', ')
