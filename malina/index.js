const Display = require('./display')
const Timetable = require('./timetable')
const utils = require('./utils')

const display = new Display()
const print = (results) => {
	const output = []
	for (const lineNum in results) {
		const times = results[lineNum]
		output.push(`${utils.padLineNumber(lineNum)}: ${times.join(', ')}`)
	}
	display.print(output)
}

const timetable = new Timetable()
timetable.on('update', print)
timetable.on('error', console.error)
timetable.on('debug', console.log)
timetable.refresh()
