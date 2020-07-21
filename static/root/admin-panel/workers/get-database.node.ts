import { req, res, log } from 'apache-js-workers'
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { DB } from 'node-json-database'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, send the user the database

		try {
			const dbName = req.body.dbName as string
			const dbPath = resolvePath(__dirname + '/../../../' + dbName)
			const dbFile = fs.readFileSync(dbPath, 'utf8')

			const db = JSON.parse(dbFile) as DB
	
			res.send(db)
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