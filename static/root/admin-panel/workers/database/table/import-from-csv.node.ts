import { queryTable, handleError } from './../../../../../private-workers/database-query'
import { File, req, res, log } from 'apache-js-workers'
import { authenticateSuToken } from '../../../../../private-workers/authenticate-su-token'
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'
import * as csv from 'csv-parser'

const suToken = req.body.suToken as string
const dbName = req.body.dbName as string
const tableName = req.body.tableName as string

const importRows = (
	file: File,
	importScript: string,
	tableFn: Parameters<Parameters<typeof queryTable>[2]>[0]
) => new Promise<{ [ key: string ]: any }[]>((resolve, reject) => {
	const separator = tableFn.data?.seperator ?? ','
	const stream = fs.createReadStream(file.tempPath).pipe(csv({ separator }))
	const rows = []

	stream.on('data', data => rows.push(data))
	stream.on('error', reject)

	stream.on('end', () => {
		const path = resolvePath(`${ __dirname }/../../../../../${ importScript }`)

		try {
			const { parse } = require(path)
			resolve(parse(rows))
		} catch(err) {
			log('e', `==========\nAn error occured while importing csv: ${ err }\nStacktrace: ${ err.stack }\nRows: ${ JSON.stringify(rows, null, 2) }\nimport script path: ${ path }\n==========`)
			reject(err)
		}
	})
})

authenticateSuToken(suToken)
	.then(() => {
		try {
			queryTable(dbName, tableName, async tableFn => {
				const importScript = tableFn?.data?.importScript as string
				const file = req.files?.[0]

				if (importScript != null && file != null) {
					try {
						await importRows(file, importScript, tableFn)
						res.send('Imported Rows!')
					} catch(err) {
						// Send 500 error

						res.statusCode = 500
						log('e', err.stack ?? err)
						res.send('Internal Server Error')
					}
				} else {
					// Send 400 error

					res.statusCode = 400
					res.send('Bad Request')
				}
			})
		} catch(err) {
			handleError(err)
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})