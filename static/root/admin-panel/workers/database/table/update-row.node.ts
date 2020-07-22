import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'
import { DB_Table_Row_Formatted } from 'node-json-database'

const dbName = req.body.dbName as string
const tableName = req.body.tableName as string
const rowNum = req.body.rowNum as number
const newRow = req.body.newRow as DB_Table_Row_Formatted

queryTable(
	dbName,
	tableName,
	table => table.update(newRow, row => row.rowNum == rowNum)
)
	.then(() => {
		res.send('Row updated')
	})
	.catch(err => {
		handleError(err)
	})