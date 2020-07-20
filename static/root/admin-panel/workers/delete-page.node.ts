import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { compile }  from './../../../private-workers/compile'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to delete the page from the database

		try {
			const pageId = req.body.pageId as number

			const pagesDB = db(__dirname + '/../../../pages.json')
			const pagesTable = pagesDB.table('pages')

			// Delete the page from the database

			pagesTable.delete(row => row.id == pageId)

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