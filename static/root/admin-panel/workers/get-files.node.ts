import { req, res } from 'apache-js-workers'
import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

interface _File {
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

// Get the token from the request

const token = req.body.token as string

const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8')

// Verify the token

jwt.verify(token, jwtSecret, err => {
	if (!err) {
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
		const files: _File[] = []

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
	} else {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	}
})