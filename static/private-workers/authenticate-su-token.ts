import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

const jwtSecret = fs.readFileSync(__dirname + '/../.jwtsecret', 'utf-8')

const authenticateSuToken = (suToken: string) => new Promise((resolve, reject) => {
	if (suToken == undefined) {
		reject()
		return
	}

	// Verify the token
	
	jwt.verify(suToken, jwtSecret, (err, decoded: any) => {
		if (!err) {
			if (decoded.tokenType == 'su-token') {
				// Authenticated

				resolve()
			} else {
				// Non-suToken
	
				reject()
			}
		} else {
			// Not authenticated
	
			reject()
		}
	})
})

export = authenticateSuToken