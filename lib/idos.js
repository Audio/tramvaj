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

	const getDepartures = (opts) => {
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
			return connections.map(connection => {
				let routes = connection.aoTrains[0].aoRoute
				let from = routes[0]
				let to = routes[routes.length - 1]
				return {
					distance: connection.attributes.sDistance,
					timeLength: connection.attributes.sTimeLength,
					from: {
						station: from.oStation.attributes.sName,
						time: from.attributes.sDepTime,
					},
					to: {
						station: to.oStation.attributes.sName,
						time: to.attributes.sDepTime,
					},
				}
			})
		})
	}

	return { login, getDepartures }
}
