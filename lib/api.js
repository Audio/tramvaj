const debug = require('debug')('tramvaj')
const soap = require('soap')

exports.createClient = (url, credentials, next) => {
	soap.createClient(url, (e, client) => {
		if (e) return next(e)
		return next(null, createApiClient(client, credentials))
	})
}

const createApiClient = (soapClient, credentials) => {
	let sessionId = null

	const parseErr = (body) => {
		let reason = body.match(/<faultstring>(.+)<\/faultstring>/)
		return (reason ? reason[1] : null) || 'Unknown error'
	}

	const login = (next) => {
		soapClient.Login({
			sUserName: credentials.name,
			sPassword: credentials.pass,
		}, (e, r) => {
			if (e && e.body) {
				return next(`Login error: ${parseErr(e.body)}`)
			}

			if (e) return next(e)

			sessionId = r && r.LoginResult && r.LoginResult.sSessionID
			if (!sessionId) {
				return next('Login error: Missing session id')
			}
			debug(`Login successful. Got session id ${sessionId}`)
			return next()
		})
	}

	const findEarliest = (opts, next) => {
		let query = {
			sSessionID: sessionId,
			sCombID: opts.areaId,
			iMaxCount: opts.maxResults,
			sDate: opts.date,
			sTime: opts.time,
			iAlgorithm: Number(!opts.directOnly),
			bIsDepTime: opts.isDepartureTime,
			aoFrom: {
				VirtListItemInfo: {
					attributes: {
						sName: opts.from,
					},
				},
			},
			aoTo: {
				VirtListItemInfo: {
					attributes: {
						sName: opts.to,
					},
				},
			},
		}

		debug(`Finding earliest time since ${opts.time}, ${opts.date}`)
		soapClient.Connection2(query, (e, r) => {
			if (e && e.body) return next(`Find error: ${parseErr(e.body)}`)
			if (e) return next(e)

			let connections = r && r.Connection2Result && r.Connection2Result.oConnInfo && r.Connection2Result.oConnInfo.aoConnections
			let times = []
			for (let i = 0; i < opts.maxResults; i++) {
				// let time = connections?[i]?.aoTrains?[0]?.aoRoute?[0]?.attributes?.sDepTime
				let time = connections && connections[i] && connections[i].aoTrains &&
					connections[i].aoTrains[0] && connections[i].aoTrains[0].aoRoute &&
					connections[i].aoTrains[0].aoRoute[0] && connections[i].aoTrains[0].aoRoute[0].attributes &&
					connections[i].aoTrains[0].aoRoute[0].attributes.sDepTime
				if (time) times.push(time)
			}
			if (!times.length) return next('Find error: no earliest time recognized')
			debug(`Result: ${times}`)
			return next(null, times.join(', '))
		})
	}

	return { login, findEarliest }
}
