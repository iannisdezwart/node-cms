const searchParams = new URLSearchParams(window.location.search)

document.addEventListener('keydown', e => {
	if (e.key == 'Enter') {
		($('button#login') as HTMLButtonElement).click()
	}
})

const login = () => {
	const username = ($('#username') as HTMLInputElement).value.trim()
	const password = ($('#password') as HTMLInputElement).value

	request('/admin-panel/workers/login.node.js', 'POST', { username, password })
		.then(token => {
			Cookies.set('token', token)
			Cookies.set('username', username)

			const redirectUrl = searchParams.get('to')

			if (redirectUrl != null) {
				document.location.pathname = redirectUrl
			} else {
				document.location.pathname = '/admin-panel/'
			}
		})
		.catch(res => {
			if (res.status == 403) {
				if ($('.try-again') == null) {
					$('.login').innerHTML += '<span class="try-again">Try again</span>'
				}
			}
		})
}