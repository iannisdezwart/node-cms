import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'

// Get the token from the request

const suToken = req.body.suToken as string

// Verify the suToken

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, send the pages

		const pagesDB = db(__dirname + '/../../../pages.json')

		const pages = pagesDB.table('pages').get().rows
		const pageTypes = pagesDB.table('pageTypes').get().rows

		res.send({ pages, pageTypes })
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})