import { db } from 'node-json-database'

const authenticate = (loginData: { username: string, password: string }) => {
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
		const searchTable = adminTable.get().where(row => row.username == loginData.username && row.password == loginData.password)

		// Check if the Login Data exists in the database
		
		if (searchTable.length == 1) {
			// Authenticated

			resolve()
		} else {
			// Not authenticated

			reject()
		}
	})
}

export = authenticate