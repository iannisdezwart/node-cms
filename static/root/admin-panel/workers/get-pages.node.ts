import { req, res } from 'apache-js-workers'
import { db } from 'node-json-database'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

// Get the token from the request

const token = req.body.token as string

const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8')

// Verify the token

jwt.verify(token, jwtSecret, err => {
	if (!err) {
		// Authenticated, send the pages

		const pagesDB = db(__dirname + '/../../../pages.json')

		const pages = pagesDB.table('pages').get().rows
		const pageTypes = pagesDB.table('pageTypes').get().rows

		res.send({ pages, pageTypes })
	} else {
		// Send 403 error

		res.statusCode = 403
		res.send('Forbidden')
	}
})