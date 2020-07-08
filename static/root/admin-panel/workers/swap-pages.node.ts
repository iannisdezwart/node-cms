import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import * as authenticateSuToken from '../../../private-workers/authenticate-su-token'
import * as compile from '../../../private-workers/compile'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to swap the pages

		try {
			const page1 = req.body.page1 as Page
			const page2 = req.body.page2 as Page

			const pagesDB = db(__dirname + '/../../../pages.json')
			const pagesTable = pagesDB.table('pages')

			// Get the page records from the database

			const page1Record = pagesTable.get().where(row => row.id == page1.id).rows[0]
			const page2Record = pagesTable.get().where(row => row.id == page2.id).rows[0]

			// Swap the IDs

			const page1ID = page1Record.id
			page1Record.id = page2Record.id
			page2Record.id = page1ID

			// Update the page records

			pagesTable.update(page2Record, row => row.id == page1.id)
			pagesTable.update(page1Record, row => row.id == page2.id)

			// Compile the website

			compile()
				.then(() => {
					res.send('Succesfully swapped page order!')
				})
				.catch(err => {
					throw err
				})
		} catch(err) {
			console.error(`Error while swapping pages: ${ err }`)

			// Send 500 error

			res.statusCode = 500
			res.send('Forbidden')
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})