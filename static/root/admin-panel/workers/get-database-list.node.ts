import { req, res, log } from 'apache-js-workers'
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'

interface DB_Info {
	name: string
	size: number
	modified: Date
}

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, send the user the database list

		try {
			const dbPathListFilePath = resolvePath(__dirname + '/../../../databases.json')
			const dbPathListFile = fs.readFileSync(dbPathListFilePath, 'utf8')
			const dbPathList = JSON.parse(dbPathListFile) as string[]

			const dbList: DB_Info[] = []

			for (let dbPath of dbPathList) {
				const dbFilePath = resolvePath(__dirname + '/../../../' + dbPath)
				const dbFileStats = fs.statSync(dbFilePath)

				dbList.push({
					name: dbPath,
					size: dbFileStats.size,
					modified: dbFileStats.mtime
				})
			}
	
			res.send(dbList)
		} catch(err) {
			// Send 500 error

			log('e', err)

			res.statusCode = 500
			res.send('Internal Server Error')
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})