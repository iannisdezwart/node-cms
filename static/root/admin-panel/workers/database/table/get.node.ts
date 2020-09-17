import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { req, res } from 'apache-js-workers'
import { DB_Table_Row_Formatted } from 'node-json-database'

const dbName = req.body.dbName as string
const tableName = req.body.tableName as string
let from = req.body.from as number
let to = req.body.to as number

let filterArr = req.body.filterArr as Filter[] ?? []
let orderArr = req.body.orderArr as (string | [ string, 'ASC' | 'DESC' ])[] ?? []
let builtInFilterArr = req.body.builtInFilterArr as string[]

interface Filter {
	colName: string
	operator: string
	value: string
}

const generateFilterFunction = (filter: Filter) => {
	const { colName, operator, value } = filter

	switch (operator) {
		case '==': return (row: DB_Table_Row_Formatted) => row[colName] == value
		case '>': return (row: DB_Table_Row_Formatted) => row[colName] > value
		case '>=': return (row: DB_Table_Row_Formatted) => row[colName] >= value
		case '<': return (row: DB_Table_Row_Formatted) => row[colName] < value
		case '<=': return (row: DB_Table_Row_Formatted) => row[colName] <= value
	}

	throw new Error(`Unrecognised operator ${ operator }`)
}

queryTable(
	dbName,
	tableName,
	tableFn => {
		let table = tableFn.get()

		// Add rowNum to each row

		let i = 0

		for (let row of table.rows) row.rowNum = i++

		// Filter table

		if (filterArr.length) {
			for (let filter of filterArr) {
				table = table.where(generateFilterFunction(filter))
			}
		}

		for (let filter of builtInFilterArr) {
			// Never let the user input a built-in filter function

			const filterFunction = eval(tableFn.data.filters[filter])
			console.log(filterFunction)

			if (filterFunction != null) {
				table = table.where(filterFunction)
			}
		}

		// Store the number of total rows

		const totalRows = table.length

		// Order table

		if (orderArr.length) table = table.orderBy(orderArr)

		// Get rows between indices

		if (from == null) from = 0
		if (to == null) to = table.length - 1
		if (from != 0 || to != table.length - 1) table = table.between(from, to)

		// Send the table

		const { rows, cols } = table
		const { data } = tableFn

		res.send({ rows, cols, data, totalRows })
	})
	.catch(err => {
		handleError(err)
	})