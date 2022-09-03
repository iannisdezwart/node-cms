import { execFile } from 'child_process'
import * as fs from 'fs'

export const compile = () => {
	const child = execFile('node', [ __dirname + '/../compiler' ], {
		// Set cwd manually to the site directory, otherwise cwd will be ApacheJS's dir

		cwd: __dirname + '/../'
	})

	// Store stdout and stderr to a compilation log file

	if (!fs.existsSync(__dirname + '/../.compilation-logs')) {
		fs.mkdirSync(__dirname + '/../.compilation-logs')
	}

	const logFileId = Date.now()
	const logFile = fs.createWriteStream(__dirname + `/../.compilation-logs/${ logFileId }.log`)

	child.stdout.on('data', data => {
		logFile.write(data)
	})

	child.stderr.on('data', data => {
		logFile.write(data)
	})

	child.on('close', code => {
		if (code != 0) {
			logFile.write(`Compilation failed with code ${ code }`)
		}

		logFile.write(`Compilation finished successfully`)
		logFile.end()

		// Delete the log file after one minute

		setTimeout(() => {
			fs.unlinkSync(__dirname + `/../.compilation-logs/${ logFileId }.log`)
		}, 60000)
	})

	return logFileId.toString()
}