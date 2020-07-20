// Save superuser token in memory

let globalSuToken: string

const getSuToken = async (
	loginData?: {
		username: string
		password: string
	}
): Promise<string> => {
	// Send the existing suToken if it exists

	if (globalSuToken != undefined) {
		return globalSuToken
	}

	if (loginData == undefined) {
		const { username, password } = await requestLoginData()

		return await getSuToken({ username, password })
	}

	if (loginData.username == undefined || loginData.password == undefined) {
		const { username, password } = await requestLoginData()

		return await getSuToken({ username, password })
	}

	try {

		const res = await request('/admin-panel/workers/get-su-token.node.js', { loginData })

		// Open the padlock icon

		setPadlock('unlocked')

		// Set the suToken globally
		
		globalSuToken = res.body
		return globalSuToken

	} catch(res) {

		if (res.status == 403) {
			// Incorrect password

			try {
				const { username, password } = await requestLoginData(true)

				return await getSuToken({ username, password })
			} catch(err) {
				// User cancelled
			}
		} else {
			// This should never happen

			notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
		}

	}
}

const requestLoginData = async (incorrect = false) => {
	const title = incorrect ? 'Incorrect Password' : 'Authentication Required'
	const subtitle = incorrect ? 'Please try again' : 'Please enter your password'

	const popupResult = await popup(title, subtitle, [
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

	return { username: Cookies.get('username'), password }
}

const togglePadlock = async () => {
	if (globalSuToken != undefined) {
		globalSuToken = undefined

		setPadlock('locked')
	} else {
		const suToken = await getSuToken()

		if (suToken != undefined) {
			setPadlock('unlocked')
		}
	}
}

const setPadlock = (mode: 'locked' | 'unlocked') => {
	const padlockImage = $('#padlock > img') as HTMLImageElement

	if (mode == 'locked') {
		padlockImage.src = '/admin-panel/img/locked-padlock-orange.png'
		padlockImage.title = 'You are currently not authorised to make changes, click here to gain permission'
	} else {
		padlockImage.src = '/admin-panel/img/unlocked-padlock-green.png'
		padlockImage.title = 'You are currently authorised to make changes'
	}
}

const login = async (
	secondTry = false
) => {
	const popupResult = await popup(
		'Login',
		secondTry ? 'Incorrect password. ' : '' + 'Please enter your password to login',
		[
			{
				name: 'Login'
			}
		],
		[
			{
				name: 'username',
				placeholder: 'Username',
				enterTriggersButton: 'Login',
				type: 'text',
			},
			{
				name: 'password',
				placeholder: 'Password',
				enterTriggersButton: 'Login',
				type: 'password'
			}
		]
	)

	const username = popupResult.inputs.get('username')
	const password = popupResult.inputs.get('password')

	try {
		const res = await request('/admin-panel/workers/login.node.js', { username, password })

		Cookies.set('token', res.body)
		Cookies.set('username', username)

		await getSuToken({ username, password })
	} catch(err) {
		if (err.status == 403) {
			// Let the user try to login again recursively

			return await login(true)
		}
	}
}