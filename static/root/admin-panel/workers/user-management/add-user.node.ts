import { req, res, log } from 'apache-js-workers'
import { db } from 'node-json-database'
import { authenticateSuToken } from './../../../../private-workers/authenticate-su-token'
import * as bcrypt from 'bcrypt'

// Get the suToken from the request

const suToken = req.body.suToken as string
const username = req.body.username as number
const password = req.body.password as number

// Authenticate

authenticateSuToken(suToken)
	.then(() => {
		// Authenticated, try to delete the user

		try {
			const userDB = db(__dirname + '/../../../../users.json')
			const adminTable = userDB.table('admins')

			adminTable.insert([{
				username,
				password: bcrypt.hashSync(password, 12),
				adminLevel: 'normal'
			}])

			res.send('Added user!')
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