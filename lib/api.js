const debug = require('debug')('tramvaj')
const soap = require('soap-as-promised')

exports.createClient = (url, credentials, next) => {
	return soap.createClient(url)
	.then(client => createApiClient(client, credentials))
}

const createApiClient = (soapClient, credentials) => {
	let sessionId = null

	const parseErr = (body) => {
		let reason = body.match(/<faultstring>(.+)<\/faultstring>/)
		return (reason ? reason[1] : null) || 'Unknown error'
	}

	const handleError = (err) => {
		if (err && err.body) throw new Error(parseErr(err.body))
		throw err
	}

	const login = () => {
		return soapClient.Login({
			sUserName: credentials.name,
			sPassword: credentials.pass,
		})
		.catch(handleError)
		.then(r => {
			sessionId = r && r.LoginResult && r.LoginResult.sSessionID
			if (!sessionId) {
				throw new Error('Login error: Missing session id')
			}
			debug(`Login successful. Got session id ${sessionId}`)
		})
	}

	const findEarliest = (opts) => {
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
		return soapClient.Connection2(query)
		.catch(handleError)
		.then(r => {
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
			if (!times.length) throw new Error('Find error: no earliest time recognized')
			debug(`Result: ${times}`)
			return times.join(', ')
		})
	}

	return { login, findEarliest }
}
