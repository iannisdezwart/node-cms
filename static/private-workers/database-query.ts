import { req, res, log } from 'apache-js-workers'
import { authenticateSuToken } from './authenticate-su-token'
import { db } from 'node-json-database'

class QueryError extends Error {
	constructor(public code: number, message: string = '') {
		super(message)
		this.name = 'QueryError'
	}
}

export const queryDatabase = (
	dbName: string,
	queryCallback: (database: ReturnType<typeof db>) => void
) => new Promise<void>((resolve, reject) => {
	// Get the suToken from the request
	
	const suToken = req.body.suToken as string
	
	authenticateSuToken(suToken)
		.then(() => {
			// Authenticated, execute query

			const database = db(__dirname + '/../' + dbName, {
				safeAndFriendlyErrors: true
			})
	
			if (!database.exists) {
				reject(new QueryError(400, `Database '${ dbName }' was not found`))
			}
	
			try {
				// Run the callback, which should contain the queries

				queryCallback(database)
			} catch(err) {
				reject(new QueryError(500, err.message))
			}

			// Query ran successfully

			resolve()
		})
		.catch(() => {
			reject(new QueryError(403))
		})
})

export const queryTable = (
	dbName: string,
	tableName: string,
	queryCallback: (table: ReturnType<ReturnType<typeof db>['table']>) => void
) => new Promise<void>((resolve, reject) => {
	// Get the suToken from the request
	
	const suToken = req.body.suToken as string
	
	authenticateSuToken(suToken)
		.then(() => {
			// Authenticated, execute query

			const database = db(__dirname + '/../' + dbName, {
				safeAndFriendlyErrors: true
			})
	
			if (!database.exists) {
				reject(new QueryError(400, `Database '${ dbName }' was not found`))
			}
	
			const table = database.table(tableName)
	
			if (!table.exists) {
				reject(new QueryError(400, `Table '${ tableName }' was not found in database '${ tableName }'`))
			}
	
			try {
				// Run the callback, which should contain the queries

				queryCallback(table)
			} catch(err) {
				reject(new QueryError(500, err.message))
			}

			// Query ran successfully

			resolve()
		})
		.catch(() => {
			reject(new QueryError(403))
		})
})

export const handleError = (err: QueryError) => {
	res.statusCode = err.code

	log('e', err.toString())

	if (err.code == 400) {
		res.send('Bad Request: ' + err.message)
	} else if (err.code == 403) {
		res.send('Forbidden')
	} else if (err.code == 500) {
		res.send('Database Error: ' + err.message)
	} else {
		res.send('Unhandled Error: ' + err.message)
	}
}