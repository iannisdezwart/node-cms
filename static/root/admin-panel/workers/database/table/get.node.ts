import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'

const dbName = req.body.dbName as string
const tableName = req.body.tableName as string

let orderArr = req.body.orderArr as (string | [ string, 'ASC' | 'DESC' ])[]
if (orderArr == undefined) orderArr = []

queryTable(
	dbName,
	tableName,
	tableFn => {
		const table = tableFn.get()
		const orderedTable = table.orderBy(orderArr)
		const { rows, cols } = orderedTable

		res.send({ rows, cols })
	}
)
	.catch(err => {
		handleError(err)
	})