const configPath = require('path').resolve(__dirname, '../.env')
require('dotenv').config({ path: configPath })

for (const key of ['PORT']) {
	if (key in process.env) continue

	console.log(`Environment variable '${key}' not set`)
	process.exit(1)
}

module.exports = {
	port: process.env.PORT,
}
