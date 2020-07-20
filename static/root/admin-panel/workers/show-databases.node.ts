import { req, res, log } from 'apache-js-workers'
import * as fs from 'fs'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { DB } from 'node-json-database'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, send the user the databases

		try {
			const dbListFile = fs.readFileSync(__dirname + '/../../../databases.json', 'utf8')
			const dbList = JSON.parse(dbListFile) as string[]
	
			const dbs: DB[] = []
	
			for (let dbName of dbList) {
				const dbFile = fs.readFileSync(__dirname + '/../../../' + dbName, 'utf-8')
				const db = JSON.parse(dbFile) as DB
	
				dbs.push(db)
			}
	
			res.send(dbs)
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