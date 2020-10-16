import { req, res, log } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../../private-workers/authenticate-su-token'

// Get the suToken from the request

const suToken = req.body.suToken as string
const userID = req.body.userID as number

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to delete the user

		try {
			const userDB = db(__dirname + '/../../../../users.json')
			const adminTable = userDB.table('admins')

			const entries = adminTable.get().where(row => row.userID == userID)

			if (entries.length == 1 && entries.rows[0].adminLevel != 'root') {
				adminTable.deleteWhere(row => row.userID == userID)

				res.send('Deleted User!')
			} else {
				res.statusCode = 409
				res.send('Cannot delete a root user')
			}
		} catch(err) {
			res.statusCode = 500
			log('e', err.stack ?? err)
			res.send('Internal Server Error')

			console.log(err)
			log('e', err)
		}
	})
	.catch(() => {
		res.statusCode = 403
		res.send('Forbidden')
	})