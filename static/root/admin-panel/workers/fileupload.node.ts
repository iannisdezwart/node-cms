import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import * as authenticateSuToken from './../../../private-workers/authenticate-su-token'

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
		// Authenticated, try to store all files

		const path = req.body.path as string

		try {
			for (let file of req.files) {
				let i = 0
			
				// Parse File Name and File Extension
			
				const fileName = file.name.split('.').slice(0, -1).join('.')
				const fileExtension = file.name.split('.').slice(-1).join('')
			
				// Loop until a non-existing file path is found
			
				while (true) {
					// Create suffix for copies
			
					const suffix = (i == 0) ? '' : '-' + i.toString()
					const filePath = resolvePath(`${ __dirname }/../../content${ path }/${ fileName }${ suffix }.${ fileExtension }`)
			
					i++
			
					// If the File Path exists, try again
			
					if (fs.existsSync(filePath)) {
						continue
					}

					if (dotDotSlashAttack(filePath)) {
						// Send 403 error
			
						res.statusCode = 403
						res.send('Forbidden')

						throw `POSSIBLE DOT-DOT-SLASH ATTACK! user tried to upload to this path: ${ filePath }`
					}
			
					// Write the file if the File Path does not exist, and break the loop

					fs.copyFileSync(file.tempPath, filePath)

					break
				}
			}
			
			res.send('Files uploaded!')
		} catch(err) {
			// Send 500 error if anything goes wrong and throw the error

			res.statusCode = 500
			res.send('An internal server error occured while uploading the files')
		
			throw err
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})