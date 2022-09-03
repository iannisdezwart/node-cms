import { log, req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../private-workers/authenticate-su-token'
import { compile }  from './../../../private-workers/compile'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to swap the pages

		try {
			const pageSwaps = req.body.pageSwaps as [ number, number ][]

			const pagesDB = db(__dirname + '/../../../pages.json')
			const pagesTable = pagesDB.table('pages')

			for (const pageSwap of pageSwaps) {
				const page1Id = pageSwap[0]
				const page2Id = pageSwap[1]

				// Get the page records from the database

				const page1Record = pagesTable.get().where(row => row.id == page1Id).rows[0]
				const page2Record = pagesTable.get().where(row => row.id == page2Id).rows[0]

				// Swap the IDs

				const page1ID = page1Record.id
				page1Record.id = page2Record.id
				page2Record.id = page1ID

				// Update the page records

				pagesTable.update(page2Record, row => row.id == page1Id)
				pagesTable.update(page1Record, row => row.id == page2Id)
			}

			// Compile the website

			const logFileId = compile()
			log('i', 'Compiling website, log file ID: ' + logFileId)
			res.send(JSON.stringify({ logFileId }))
		} catch(err) {
			// Send 500 error

			res.statusCode = 500
			log('e', err.stack ?? err)
			res.send('Internal Server Error')
		}
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})