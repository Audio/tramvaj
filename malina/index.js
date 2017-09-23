const Display = require('./display')
const Timetable = require('./timetable')
const utils = require('./utils')

let display = new Display()
const print = (results) => {
	let output = []
	for (let lineNum in results) {
		let times = results[lineNum]
		output.push(`${utils.padLineNumber(lineNum)}: ${times.join(', ')}`)
	}
	display.print(output)
}

let timetable = new Timetable()
timetable.on('update', print)
timetable.on('error', console.error)
timetable.on('debug', console.log)
timetable.refresh()
