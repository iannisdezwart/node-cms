// Save superuser token in memory

let globalSuToken: string

const getSuToken = async (
	loginData?: {
		username: string
		password: string
	},
	secondTry = false
): Promise<string> => {
	// Send the existing suToken if it exists

	if (globalSuToken == undefined) {
		try {

			const res = await request('/admin-panel/workers/get-su-token.node.js', 'POST', { loginData })

			// Open the padlock icon

			const padlockImage = $('#padlock > img') as HTMLImageElement
			padlockImage.src = '/admin-panel/img/unlocked-padlock-green.png'
	
			// Set the suToken globally
			
			globalSuToken = res
			return globalSuToken

		} catch(res) {

			if (res.status == 403) {
				// Incorrect password

				if (secondTry) {
					// User inputted wrong password

					try {
						const popupResult = await popup('Incorrect Password', 'Please try again...', [
							{
								name: 'Submit'
							}
						], [
							{
								name: 'password',
								placeholder: 'Enter your password...',
								type: 'password',
								enterTriggersButton: 'Submit'
							}
						])

						const password = popupResult.inputs.get('password')

						return await getSuToken({ username: Cookies.get('username'), password }, true)
					} catch(err) {
						// User cancelled
					}
				} else {
					// suToken does not exist

					try {
						const popupResult = await popup('Authentication Required', 'Please enter your password', [
							{
								name: 'Submit'
							}
						], [
							{
								name: 'password',
								placeholder: 'Enter your password...',
								type: 'password',
								enterTriggersButton: 'Submit'
							}
						])

						const password = popupResult.inputs.get('password')
		
						return await getSuToken({ username: Cookies.get('username'), password }, true)
					} catch(err) {
						// User cancelled
					}
				}
			} else {
				// This should never happen
	
				notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
			}

		}
	} else {
		return globalSuToken
	}
}

const togglePadlock = async () => {
	if (globalSuToken != undefined) {
		globalSuToken = undefined

		const padlockImage = $('#padlock > img') as HTMLImageElement
		padlockImage.src = '/admin-panel/img/locked-padlock-orange.png'
		padlockImage.title = 'You are currently not authorised to make changes, click here to gain permission'
	} else {
		const suToken = await getSuToken()

		if (suToken != undefined) {
			const padlockImage = $('#padlock > img') as HTMLImageElement
	
			padlockImage.src = '/admin-panel/img/unlocked-padlock-green.png'
			padlockImage.title = 'You are currently authorised to make changes'
		}
	}
}