module.exports = {
	extends: 'standard',
	installedESLint: true,
	plugins: [
		'standard',
		'promise',
	],
	env: {
		mocha: true
	},
	rules: {
		'consistent-return': 2,
		'comma-dangle': [2, 'always-multiline'],
		'indent': [2, 'tab'],
		'no-else-return': 2,
		'no-tabs': 0,
		'no-var': 2,
		'radix': 2,
	}
}
