import { req, res, log } from 'apache-js-workers'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { db, DB_Table_Row_Formatted } from 'node-json-database'
import { resolve as resolvePath } from 'path'

// Get the suToken from the request

const suToken = req.body.suToken as string

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, update database

		const dbName = req.body.dbName as string
		const tableName = req.body.tableName as string
		const rowNum = req.body.rowNum as number
		const newRow = req.body.row as DB_Table_Row_Formatted

		const database = db(__dirname + '/../../../' + dbName)

		if (!database.exists) {
			// Send 400 error

			res.statusCode = 400
			res.send(`Bad Request: Database '${ dbName }' was not found`)
			return
		}

		const table = database.table(tableName)

		if (!table.exists) {
			// Send 400 error

			res.statusCode = 400
			res.send(`Bad Request: Table '${ tableName }' was not found in database '${ tableName }'`)
			return
		}

		try {
			table.update(newRow, row => {
				console.log(row)
				return row.rowNum == rowNum
			})
		} catch(err) {
			// Send 500 error

			res.statusCode = 500
			res.send(`Internal Server Error`)

			log('e', err)
			return
		}

		// Send 200

		res.send('Updated table row')
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})