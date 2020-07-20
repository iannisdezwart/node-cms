import { db } from 'node-json-database'
import * as bcrypt from 'bcrypt'

export const authenticate = (loginData: { username: string, password: string }) => {
	return new Promise((resolve, reject) => {
		// Handle null data

		if (loginData == undefined) {
			reject()
			return
		}

		if (loginData.username == undefined || loginData.password == undefined) {
			reject()
			return
		}

		// Search for the Login Data in the database
	
		const adminTable = db(__dirname + '/../users.json').table('admins')
		const searchTable = adminTable.get().where(row => row.username == loginData.username)

		// Check if the Login Data exists in the database
		
		if (searchTable.length == 1) {
			const userRecord = searchTable.rows[0]

			// Check password

			const match = bcrypt.compareSync(loginData.password, userRecord.password)

			if (match) {
				// Password matches

				resolve()
			} else {
				// Password does not match 

				reject()
			}
		} else {
			// User does not exist

			reject()
		}
	})
}