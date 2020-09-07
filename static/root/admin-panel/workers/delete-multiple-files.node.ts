import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { filePathIsSafe } from './../../../private-workers/security'

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
		// Authenticated, try to delete the file

		try {
			const filePaths = req.body.filePaths as string[]

			for (let filePath of filePaths) {
				filePath = resolvePath(`${ __dirname }/../../content${ filePath }`)

				if (!filePathIsSafe(filePath, __dirname + '/../../')) {
					// Send 403 error
		
					res.statusCode = 403
					res.send('Forbidden')
					
					console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to delete this file: ${ filePath }`)
		
					return
				}
		
				if (fs.existsSync(filePath)) {
					const stats = fs.statSync(filePath)
	
					if (stats.isDirectory()) {
						rimraf(filePath)
	
						res.send('Sucesssfully deleted the directory')
					} else {
						fs.unlinkSync(filePath)
	
						res.send('Sucesssfully deleted the file')
					}
				} else {
					// Send 500 error
	
					res.statusCode = 500
					res.send('File does not exist')
				}
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