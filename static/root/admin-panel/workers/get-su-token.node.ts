import { req, res } from 'apache-js-workers'
import { authenticate } from './../../../private-workers/authenticate'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

// Get Login Data from the request

const loginData = req.body.loginData as { username: string, password: string }

// Authenticate

authenticate(loginData)
	.then(() => {
		// Authenticated, send the user a token

		const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8')

		const suToken = jwt.sign({
			username: loginData.username,
			tokenType: 'su-token',
			aud: 'node-cms-admin-panel'
		}, jwtSecret, {
			expiresIn: '1h'
		})

		res.send(suToken)
	})
	.catch(() => {
		res.statusCode = 403

		res.send('Authentication Failure')
	})