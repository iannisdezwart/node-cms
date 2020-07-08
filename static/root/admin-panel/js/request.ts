type HTTPMethod = 'GET' | 'POST'

const request = (
	url: string,
	method: HTTPMethod = 'GET',
	body: Object = {},
	files: File[] = []
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest()
		
		req.onreadystatechange = () => {
			if (req.readyState == 4) {
				if (req.status >= 200 && req.status < 300) {
					resolve(req.response)
				} else {
					reject({ status: req.status, response: req.responseText })
				}
			}
		}

		req.open(method, url)

		const formData = new FormData()

		if (body != undefined) {
			formData.append('body', JSON.stringify(body))
		}

		if (files != undefined) {
			for (let file of files) {
				formData.append(file.name, file)
			}
		}

		req.send(formData)
	})
}

const handleRequestError = (err: { status: number, response: string }) => {
	if (err.status == 403) {
		// This should only happen on a session timeout
		// Clear the suToken

		globalSuToken = undefined

		notification('Session Timed Out', `Please retry.`)
	} else {
		// This should never happen

		notification('Session', `status code: ${ err.status }, body: <code>${ err.response }</code>`)
	}
}