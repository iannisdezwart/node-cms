import { req, res, log } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../../private-workers/authenticate-su-token'
import * as bcrypt from 'bcrypt'

// Get the suToken from the request

const suToken = req.body.suToken as string
const userID = req.body.userID as number
const oldPassword = req.body.oldPassword as string
const newPassword = req.body.newPassword as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to change the user's password

		try {
			const userDB = db(__dirname + '/../../../../users.json')
			const adminTable = userDB.table('admins')

			const entries = adminTable.get().where(row => row.userID == userID)

			if (
				entries.length == 1
				&& bcrypt.compareSync(oldPassword, entries.rows[0].password)
			) {
				adminTable.update({
					password: bcrypt.hashSync(newPassword, 12)
				}, row => row.userID == userID)

				res.send('Updated Password!')
			} else {
				res.statusCode = 409
				res.send('The given current password was incorrect. Please Try again.')
			}
		} catch(err) {
			res.statusCode = 500
			res.send('Internal Server Error')

			console.log(err)
			log('e', err)
		}
	})
	.catch(() => {
		res.statusCode = 403
		res.send('Forbidden')
	})