const Display = require('./display')
const Timetable = require('./timetable')

let display = new Display()

let timetable = new Timetable()
timetable.on('update', print)
timetable.on('error', console.error)
timetable.on('debug', console.log)
timetable.refresh()

function print (results) {
	let lines = results.map(({line, time}) => `tram ${line} v ${time}`)

	if (results[0]) display.print(lines[0], 1)
	if (results[1]) display.print(lines[1], 2)
}
