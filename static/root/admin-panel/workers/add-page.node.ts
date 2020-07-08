import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import * as authenticateSuToken from './../../../private-workers/authenticate-su-token'
import * as compile from './../../../private-workers/compile'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to add the page to the database

		try {
			const pageType = req.body.pageType as string
			const pageContent = req.body.pageContent as Object
	
			const pagesDB = db(__dirname + '/../../../pages.json')
			const pagesTable = pagesDB.table('pages')

			// Add the page to the database

			pagesTable.insert([ { pageType, pageContent } ])

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
	.catch(err => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')

		throw err
	})