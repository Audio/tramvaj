const Display = require('./display')
const Timetable = require('./timetable')
const utils = require('./utils')

let display = new Display()
const print = (results) => {
	let lines = results.map(({line, time}) => `tram ${utils.padLineNumber(line)} v ${time}`)
	display.print(lines)
}

let timetable = new Timetable()
timetable.on('update', print)
timetable.on('error', console.error)
timetable.on('debug', console.log)
timetable.refresh()
