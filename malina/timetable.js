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
			return body.result.map(result => ({
				line: result.line,
				time: result.from.time,
			}))
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
		if (!results.length) {
			this.debug('no results, fallback timeout')
			return config.defaultTimeoutSeconds
		}

		let nearestTime = results[0].time
		let [hours, minutes] = nearestTime.split(':')
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

		// add 1 minute (wait for the tram to leave)
		diffSec += 60

		return diffSec
	}
}

module.exports = Timetable
