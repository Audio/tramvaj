module.exports = {
	// '8' -> ' 8'
	// '25' -> '25'
	padLineNumber (line) {
		line = String(line)
		return line.length < 2 ? ` ${line}` : line
	},
}
