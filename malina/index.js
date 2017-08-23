const Timetable = require('./timetable')

const print = (results) => {
	if (!results.length) return

	let lines = results
		.map(({line, time}) => `tram ${line} v ${time}`)
		.map(line => `"${line}"`)
		.join(' ')
	console.log('PRINT:', lines)
}

let timetable = new Timetable()
timetable.on('update', print)
timetable.on('error', console.error)
timetable.on('debug', console.log)
timetable.refresh()
