import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'

const dbName = req.body.dbName as string
const tableName = req.body.tableName as string
let from = req.body.from as number
let to = req.body.to as number

let orderArr = req.body.orderArr as (string | [ string, 'ASC' | 'DESC' ])[]
if (orderArr == undefined) orderArr = []

queryTable(
	dbName,
	tableName,
	tableFn => {
		let table = tableFn.get()

		// Order table

		if (orderArr.length) table = table.orderBy(orderArr)

		// Get rows between indices

		if (from == null) from = 0
		if (to == null) to = table.length - 1
		if (from != 0 || to != table.length - 1) table = table.between(from, to)

		// Send the table

		const { rows, cols } = table
		const { data } = tableFn

		res.send({ rows, cols, data })
	}
)
	.catch(err => {
		handleError(err)
	})