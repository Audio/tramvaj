const debug = require('debug')('tramvaj')
const get = require('lodash.get')
const soap = require('soap-as-promised')

exports.createClient = (url, credentials, next) => {
	return soap.createClient(url)
	.then(client => createIdosClient(client, credentials))
}

const createIdosClient = (soapClient, credentials) => {
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
			sessionId = get(r, 'LoginResult.sSessionID')
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
			let connections = get(r, 'Connection2Result.oConnInfo.aoConnections', [])
			let times = []
			for (let i = 0; i < opts.maxResults; i++) {
				let time = get(connections, `[${i}].aoTrains[0].aoRoute[0].attributes.sDepTime`)
				if (time) times.push(time)
			}
			if (!times.length) throw new Error('Find error: no earliest time recognized')
			debug(`Result: ${times}`)
			return times.join(', ')
		})
	}

	return { login, findEarliest }
}
