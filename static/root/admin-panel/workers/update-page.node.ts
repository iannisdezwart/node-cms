import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import * as authenticateSuToken from './../../../private-workers/authenticate-su-token'
import * as compile from './../../../private-workers/compile'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to update the page in the database

		try {
			const pageId = req.body.pageId as number
			const pageContent = req.body.pageContent as Object
	
			const pagesDB = db(__dirname + '/../../../pages.json')
			const pagesTable = pagesDB.table('pages')

			// Get the current page from the database
			
			const page = pagesTable.get().where(row => row.id == pageId).rows[0]
			page.pageContent = pageContent

			// Update the record
	
			pagesTable.update(page, row => row.id == pageId)

			// Compile the website

			compile()
				.then(() => {
					res.send('Succesfully stored page!')
				})
				.catch(err => {
					throw err
				})
		} catch(err) {
			// Send 500 error

			res.statusCode = 500
			res.send('An internal server error occured while updating the page')

			throw err
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})