const configPath = require('path').resolve(__dirname, '../.env')
require('dotenv').config({ path: configPath })
const urlLib = require('url')

for (const key of ['HOSTNAME', 'FROM', 'TO']) {
	if (key in process.env) continue

	console.log(`Environment variable '${key}' not set`)
	process.exit(1)
}

module.exports = {
	defaultTimeoutSeconds: 90,
	url: urlLib.format({
		protocol: 'http',
		hostname: process.env.HOSTNAME,
		pathname: '/api/search',
		query: {
			from: process.env.FROM,
			to: process.env.TO,
			maxResults: 4,
		},
	}),
}
