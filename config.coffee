
require('dotenv').load()

for key in ['NAME', 'PASS', 'PORT'] when not process.env[key]?
  console.log "Environment variable '#{key}' not set"
  process.exit 1

module.exports =
  credentials:
    name: process.env.NAME
    pass: process.env.PASS
  port: process.env.PORT
  url: 'http://ttws.timetable.cz/tt.asmx?WSDL'
