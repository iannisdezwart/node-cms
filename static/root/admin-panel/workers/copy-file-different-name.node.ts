import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import * as authenticateSuToken from '../../../private-workers/authenticate-su-token'
import * as qcd from 'queued-copy-dir'

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
		// Authenticated, copy the file

		try {
			const source = req.body.source as string
			const destination = req.body.destination as string

			if (source == undefined || destination == undefined) {
				throw new Error(`body.source or body.destination was not provided`)
			}

			// Parse paths

			const sourcePath = resolvePath(__dirname + '/../../content' + source)
			const destinationPath = resolvePath(__dirname + '/../../content' + destination)

			// Security

			if (dotDotSlashAttack(sourcePath)) {
				// Send 403 error

				res.statusCode = 403
				res.send('Forbidden')

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: ${ sourcePath }`)

				return
			}

			if (dotDotSlashAttack(destinationPath)) {
				// Send 403 error

				res.statusCode = 403
				res.send('Forbidden')

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${ destinationPath }`)

				return
			}

			if (fs.statSync(sourcePath).isDirectory()) {
				qcd.async(sourcePath, destinationPath)
					.catch(err => {
						throw err
					})
			} else {	
				fs.copyFileSync(sourcePath, destinationPath)
			}

			res.send('Successfully copied file')
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