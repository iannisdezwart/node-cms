import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'

// Dot-dot-slash attack prevention

const dotDotSlashAttack = (path: string) => {
	const resolvedPath = resolvePath(path)
	const rootPath = resolvePath(__dirname + '/../../content')

	if (!resolvedPath.startsWith(rootPath)) {
		return true
	}

	return false
}

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, create directory
		
		try {
			const newDirectoryPathIn = req.body.newDirectoryPath as string

			const newDirectoryPath = resolvePath(__dirname + '/../../content' + newDirectoryPathIn)

			// Security

			if (dotDotSlashAttack(newDirectoryPath)) {
				// Send 403 error

				res.statusCode = 403
				res.send('Forbidden')

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to create this directory: ${ newDirectoryPath }`)

				return
			}

			fs.mkdirSync(newDirectoryPath)

			res.send('Succesfully created new directory')
		} catch(err) {
			// Send 500 error
			
			res.statusCode = 500
			res.send('Internal server error')

			console.error(err)
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})