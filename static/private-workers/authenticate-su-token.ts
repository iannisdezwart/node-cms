import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

const jwtSecret = fs.readFileSync(__dirname + '/../.jwtsecret', 'utf-8')

export const authenticateSuToken = (
	suToken: string
) => new Promise<void>((resolve, reject) => {
	if (suToken == undefined) {
		reject()
		return
	}

	// Verify the token

	jwt.verify(suToken, jwtSecret, (err, decoded: any) => {
		if (!err) {
			if (decoded.aud == 'node-cms-admin-panel' && decoded.tokenType == 'su-token') {
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