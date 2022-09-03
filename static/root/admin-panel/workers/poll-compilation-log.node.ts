import { req, res, log } from 'apache-js-workers'
import { authenticateSuToken } from '../../../private-workers/authenticate-su-token'
import * as fs from 'fs'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(async () => {
		// Authenticated, try to poll the compilation log

		try {
			const logFileId = req.body.logFileId as string
			const readOffset = req.body.readOffset as number

			// Read the log file

			if (logFileId.match(/[^0-9]/)) {
				// The log file must only consist of digits, send 400 error

				res.statusCode = 400
				res.send('Bad request')
				return
			}

			const logFileStream = fs.createReadStream(__dirname + `/../../../.compilation-logs/${ logFileId }.log`, {
				start: readOffset
			})

			for await (const chunk of logFileStream) {
				res.write(chunk)
			}

			res.send()
		} catch (err) {
			// Send 500 error

			res.statusCode = 500
			log('e', err.stack ?? err)
			res.send('An internal server error occured while polling the compilation log')
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})