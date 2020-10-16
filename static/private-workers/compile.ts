import { execFile } from 'child_process'

export const compile = () => new Promise((resolve, reject) => {
	const child = execFile('node', [ __dirname + '/../compiler' ], {
		// Set cwd manually to the site directory, otherwise cwd will be ApacheJS's dir

		cwd: __dirname + '/../'
	})

	// Store stdout and stderr

	let stdout = ''
	let stderr = ''

	child.stdout.on('data', data => stdout += data)
	child.stderr.on('data', data => stderr += data)

	child.on('close', code => {
		if (code != 0) {
			reject({ stdout, stderr })
		}

		resolve(stdout)
	})
})