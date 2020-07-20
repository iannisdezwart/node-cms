import { req, res } from 'apache-js-workers'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'
import { authenticate } from './../../../private-workers/authenticate'

// Get Login Data from the request

const loginData = req.body as { username: string, password: string }

// Authenticate

authenticate(loginData)
	.then(() => {
		// Authenticated, send the user a token
		
		const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8')

		const token = jwt.sign({ username: loginData.username }, jwtSecret, {
			expiresIn: '1d'
		})
	
		res.send(token)
	})
	.catch(() => {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	})