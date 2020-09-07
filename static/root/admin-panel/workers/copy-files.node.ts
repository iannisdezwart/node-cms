import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import * as ncp from 'ncp'
import { filePathIsSafe } from './../../../private-workers/security'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, copy the files

		try {
			const sources = req.body.sources as string[]
			const destination = req.body.destination as string

			if (sources == undefined || destination == undefined) {
				throw new Error(`body.sources or body.destination was not provided`)
			}

			// Parse destination path

			const destinationDirPath = resolvePath(__dirname + '/../../content' + destination)

			if (!filePathIsSafe(destinationDirPath, __dirname + '/../../')) {
				// Send 403 error
		
				res.statusCode = 403
				res.send('Forbidden')

				console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${ destinationDirPath }`)
	
				return
			}

			// Copy each source file

			for (let source of sources) {
				// Parse paths

				const sourcePath = resolvePath(__dirname + '/../../content' + source)
				const sourceFileName = source.substring(source.lastIndexOf('/') + 1)
				const destinationFilePath = resolvePath(destinationDirPath + '/' + sourceFileName)

				if (!filePathIsSafe(sourcePath, __dirname + '/../../')) {
					// Send 403 error

					res.statusCode = 403
					res.send('Forbidden')

					console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: ${ sourcePath }`)

					return
				}

				if (!filePathIsSafe(destinationFilePath, __dirname + '/../../')) {
					// Send 403 error

					res.statusCode = 403
					res.send('Forbidden')

					console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${ destinationFilePath }`)

					return
				}

				if (fs.statSync(sourcePath).isDirectory()) {
					// Prevent circular copying
					// Todo: fix circular copying in a better way

					if (sourcePath == destinationDirPath) {
						throw new Error(`Cannot copy a folder into itself. User tried to copy ${ sourcePath } into directory ${ destinationDirPath }`)
					}

					ncp(sourcePath, destinationFilePath, errors => {
						if (errors != undefined) {
							for (let err of errors) {
								throw err
							}
						}
					})
				} else {	
					fs.copyFileSync(sourcePath, destinationFilePath)
				}

				res.send('Successfully copied files')
			}
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