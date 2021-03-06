import { queryTable, handleError, queryDatabase } from './../../../../../private-workers/database-query'
import { log, req, res } from 'apache-js-workers'
import { DB_Table_Row_Formatted as Row, Table } from 'node-json-database'
import { authenticateSuToken } from '../../../../../private-workers/authenticate-su-token'

const suToken = req.body.suToken as string
const dbName = req.body.dbName as string
const tableName = req.body.tableName as string
const isView = req.body.isView as string
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

interface View {
	data: {
		filters: string[]
	},
	table: Table
}

const generateFilterFunction = (filter: Filter) => {
	const { colName, operator, value } = filter

	switch (operator) {
		case '==': return (row: Row) => row[colName] == value
		case '!=': return (row: Row) => row[colName] != value
		case '>': return (row: Row) => row[colName] > value
		case '>=': return (row: Row) => row[colName] >= value
		case '<': return (row: Row) => row[colName] < value
		case '<=': return (row: Row) => row[colName] <= value
		case 'startsWith': return (row: Row) => row[colName].startsWith(value)
		case '!startsWith': return (row: Row) => !row[colName].startsWith(value)
		case 'endsWith': return (row: Row) => row[colName].endsWith(value)
		case '!endsWith': return (row: Row) => !row[colName].endsWith(value)
		case 'contains': return (row: Row) => row[colName].includes(value)
		case '!contains': return (row: Row) => !row[colName].includes(value)
		case 'null': return (row: Row) => row[colName] == null
		case '!null': return (row: Row) => row[colName] != null
	}

	throw new Error(`Unrecognised operator ${ operator }`)
}

const sendTable = (
	table: Table,
	data: {
		filters: string[]
	}
) => {
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

		const filterFunction = eval(data.filters[filter])
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

	res.send({ rows, cols, data, totalRows })
}

authenticateSuToken(suToken)
	.then(() => {
		if (isView) {
			// Check if the view exists

			queryDatabase(dbName, db => {
				const views = db?.data?.views as string[] ?? []

				if (views.includes(tableName)) {
					try {
						const { createView } = require(`${ __dirname }/../../../../../${ tableName }.js`)
						const view = createView(db) as View

						sendTable(view.table, view.data)
					} catch(err) {
						// Send 500 error

						res.statusCode = 500
						log('e', err.stack ?? err)
						res.send('Internal Server Error')
					}
				} else {
					// Send 404 error

					res.statusCode = 404
					res.send('Not Found')
				}
			})
		} else {
			queryTable(dbName, tableName, tableFn => {
					let table = tableFn.get()
					let { data } = tableFn

					sendTable(table, data)
				})
				.catch(err => {
					handleError(err)
				})
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})