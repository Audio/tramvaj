const config = require('./config')
const EventEmitter = require('events')
const rp = require('request-promise')

const SEC_TO_MILLIS = 1000

class Timetable extends EventEmitter {
	debug (message) {
		let now = new Date().toISOString()
		this.emit('debug', `${now}: ${message}`)
	}

	fetch () {
		return rp({
			url: config.url,
			json: true,
		})
		.then(body => {
			if (body.error) {
				throw body.error
			}
			return body.result.reduce((aggregatedResults, result) => {
				let {line, time} = result
				aggregatedResults[line] = aggregatedResults[line] || []
				aggregatedResults[line].push(time)
				return aggregatedResults
			}, {})
		})
		.catch(err => {
			this.emit('error', err)
			return []
		})
	}

	refresh () {
		this.debug('refreshing...')
		this.fetch()
			.tap((results) => this.emit('update', results))
			.tap((results) => this.plan(results))
	}

	plan (results) {
		let timeout = this.getSecondsToNextRefresh(results)
		this.debug(`next fetch in ${(timeout / 60).toFixed(2)} minutes`)
		setTimeout(this.refresh.bind(this), timeout * SEC_TO_MILLIS)
	}

	getSecondsToNextRefresh (results) {
		let times = []
		for (let line in results) {
			times = times.concat(results[line])
		}
		times.sort()

		if (times.length < 2) {
			this.debug('too few results, fallback timeout')
			return config.defaultTimeoutSeconds
		}

		let secondNearestTime = times[1]
		let [hours, minutes] = secondNearestTime.split(':')
		let nearestDate = new Date()
		nearestDate.setHours(hours)
		nearestDate.setMinutes(minutes)
		nearestDate.setSeconds(0)
		nearestDate.setMilliseconds(0)

		let diffMillis = Number(nearestDate) - Date.now()
		let diffSec = Math.floor(diffMillis / SEC_TO_MILLIS)
		if (diffSec < 1) {
			this.debug('negative diff, fallback timeout')
			return config.defaultTimeoutSeconds
		}

		return diffSec
	}
}

module.exports = Timetable
