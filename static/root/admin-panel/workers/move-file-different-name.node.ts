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

// Recursive rimraf

const rimraf = (parentPath: string) => {
	if (fs.existsSync(parentPath)) {
		const files = fs.readdirSync(parentPath)

		for (let file of files) {
			const childPath = parentPath + '/' + file
			const stats = fs.statSync(childPath)

			if (stats.isDirectory()) {
				rimraf(childPath)
			} else {
				fs.unlinkSync(childPath)
			}
		}

		fs.rmdirSync(parentPath)
	}
}

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, move the file

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

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move this file: ${ sourcePath }`)

				return
			}

			if (dotDotSlashAttack(destinationPath)) {
				// Send 403 error

				res.statusCode = 403
				res.send('Forbidden')

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move to this file: ${ destinationPath }`)

				return
			}

			if (fs.statSync(sourcePath).isDirectory()) {
				// Prevent circular moving

				// Get Destination directory path

				const destinationDirPath = resolvePath(destinationPath.substring(0, destinationPath.lastIndexOf('/') + 1))

				if (sourcePath == destinationDirPath) {
					throw new Error(`Cannot move a folder into itself. User tried to move ${ sourcePath } into directory ${ destinationDirPath }`)
				}

				qcd.async(sourcePath, destinationPath)
					.then(() => {
						// Recursively delete the source folder after it has been copied

						rimraf(sourcePath)
					})
					.catch(err => {
						throw err
					})
			} else {	
				fs.copyFileSync(sourcePath, destinationPath)

				// Delete the source file

				fs.unlinkSync(sourcePath)
			}

			res.send('Successfully moved file')
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