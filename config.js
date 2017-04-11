require('dotenv').load()

for (let key of ['NAME', 'PASS', 'PORT']) {
	if (key in process.env) continue

	console.log(`Environment variable '${key}' not set`)
	process.exit(1)
}

module.exports = {
	credentials: {
		name: process.env.NAME,
		pass: process.env.PASS,
	},
	port: process.env.PORT,
	url: 'http://ttws.timetable.cz/tt.asmx?WSDL',
}
