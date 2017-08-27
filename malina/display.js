const LCD = (function initDevice () {
	try {
		return require('lcdi2c')
	} catch (err) {
		console.error('Cannot initialize LCD device')
		throw err
	}
})()

class Display {
	constructor () {
		const DEVICE_BUS = 1
		const DEVICE_ADDRESS = 0x3f
		const DEVICE_COLUMNS = 20
		const DEVICE_ROWS = 2

		this.lcd = new LCD(DEVICE_BUS, DEVICE_ADDRESS, DEVICE_COLUMNS, DEVICE_ROWS)
	}

	print (message, line = 1) {
		this.lcd.println(message, line)
	}
}

module.exports = Display
