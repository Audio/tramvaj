const { JSDOM } = require('jsdom')
const urlLib = require('url')

const parseResults = (document) => {
	const results = document.getElementsByClassName('conn')
	return [].map.call(results, (result) => {
		const lineTypeAndNumber = result.querySelector('.panel-body b').textContent.trim()
		const line = lineTypeAndNumber.replace(/[^\d]/g, '')
		const time = result.getElementsByClassName('timeinfo')[0].textContent
		return { line, time }
	})
}

const getResults = (url, maxResults) => {
	const options = {
		userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile',
	}

	return JSDOM.fromURL(url, options)
	.then(dom => {
		const document = dom.window.document
		const results = parseResults(document)
		return results.slice(0, maxResults)
	})
}

const getDepartures = (opts) => {
	const url = urlLib.format({
		protocol: 'https',
		hostname: 't.jizdnirady.idnes.cz',
		query: {
			fromT: opts.from,
			toT: opts.to,
			cmd: 'cmdSearch',
		},
	})

	return getResults(url, opts.maxResults)
}

module.exports = {
	getDepartures,
}
