import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { filePathIsSafe } from './../../../private-workers/security'
import * as crypto from 'crypto'

interface FileInfo {
	name: string
	path: string
	isDirectory: boolean
	filesInside: number
	size: number
	modified: Date
	hash: string
}

// Get the suToken from the request

const suToken = req.body.suToken as string

// Verify the suToken

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated

		const reqPath = req.body.path as string
		const path = resolvePath(__dirname + '/../../content' + reqPath)

		if (!filePathIsSafe(path, __dirname + '/../../')) {
			// Send 403 error

			res.statusCode = 403
			res.send('Forbidden')

			console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user requested this path: ${ path }`)

			return
		}

		// Get files

		const fileNames = fs.readdirSync(path)
		const files: FileInfo[] = []

		for (let fileName of fileNames) {
			const stats = fs.statSync(path + '/' + fileName)
			const hash = crypto.createHash('md5')
				.update(resolvePath(reqPath + '/' + fileName))
				.digest('hex')

			files.push({
				name: fileName,
				path: resolvePath(reqPath + '/' + fileName),
				isDirectory: stats.isDirectory(),
				filesInside: stats.isDirectory() ? fs.readdirSync(path + '/' + fileName).length : 0,
				size: stats.isDirectory() ? 0 : stats.size,
				modified: stats.mtime,
				hash
			})
		}

		res.send({ files })
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})