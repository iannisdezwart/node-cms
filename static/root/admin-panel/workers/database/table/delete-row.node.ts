import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'

const dbName = req.body.dbName as string
const tableName = req.body.tableName as string
const rowNum = req.body.rowNum as number

queryTable(
	dbName,
	tableName,
	table => table.delete(row => row.rowNum == rowNum)
)
	.then(() => {
		res.send('Row deleted')
	})
	.catch(err => {
		handleError(err)
	})