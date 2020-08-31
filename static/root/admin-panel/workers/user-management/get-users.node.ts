import { req, res, log } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../../private-workers/authenticate-su-token'

// Get the suToken from the request

const suToken = req.body.suToken as string

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to get the users

		try {
			const userDB = db(__dirname + '/../../../../users.json')
			const adminTable = userDB.table('admins')
			const users: User[] = []

			for (let user of adminTable.get().rows) {
				users.push({
					id: user.userID,
					name: user.username
				})
			}

			res.send(JSON.stringify(users))
		} catch(err) {
			res.statusCode = 500
			res.send('Internal Server Error')

			log('e', err)
		}
	})
	.catch(() => {
		res.statusCode = 403
		res.send('Forbidden')
	})