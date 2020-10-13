import { queryDatabase, handleError } from '../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'

const dbName = req.body.dbName as string

queryDatabase(
	dbName,
	db => {
		const tables = db.getTables()
		const info: DB_Tables_List = {}

		for (let tableName of tables) {
			const table = db.table(tableName)

			info[tableName] = {
				rowCount: table.rowCount,
				colCount: table.colCount
			}
		}

		res.send(info)
	}
)
	.catch(err => {
		handleError(err)
	})