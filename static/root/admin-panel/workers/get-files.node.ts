import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'

interface FileInfo {
	name: string
	path: string
	isDirectory: boolean
	filesInside: number
	size: number
	modified: Date
}

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

// Verify the suToken

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated

		const reqPath = req.body.path as string
		const path = resolvePath(__dirname + '/../../content' + reqPath)

		if (dotDotSlashAttack(path)) {
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

			files.push({
				name: fileName,
				path: resolvePath(reqPath) + '/' + fileName,
				isDirectory: stats.isDirectory(),
				filesInside: stats.isDirectory() ? fs.readdirSync(path + '/' + fileName).length : 0,
				size: stats.isDirectory() ? 0 : stats.size,
				modified: stats.mtime
			})
		}

		res.send({ files })
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})