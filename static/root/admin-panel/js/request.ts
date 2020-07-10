type HTTPMethod = 'GET' | 'POST'

const request = (
	url: string,
	method: HTTPMethod = 'GET',
	body: Object = {},
	files: File[] = []
): Promise<string> => {
	return new Promise(async (resolve, reject) => {
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

		const start = Date.now()

		const stringifiedBody = JSON.stringify(body)

		let res = stringToArrayBuffer(stringifiedBody)

		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const data = await file.arrayBuffer()

			// Todo: optimise memory complexity, concatenating each file is heavy
	
			res = concatArrayBuffers(res, stringToArrayBuffer(
				`\n--------------------file\n ${ JSON.stringify({
					name: file.name,
					lastModified: file.lastModified,
					size: file.size,
					type: file.type
				}) }\n`
			))

			res = concatArrayBuffers(res, data)
		}

		console.log('prepared request in ' + (Date.now() - start) + 'ms')

		req.send(res)
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

const stringToArrayBuffer = (str: string) => {
	const buffer = new ArrayBuffer(str.length)
	const view = new Uint8Array(buffer)

	for (let i = 0; i < str.length; i++) {
		view[i] = str.charCodeAt(i)
	}

	return buffer
}

const concatArrayBuffers = (ab1: ArrayBuffer, ab2: ArrayBuffer) => {
	const out = new Uint8Array(ab1.byteLength + ab2.byteLength)

	out.set(new Uint8Array(ab1), 0)
	out.set(new Uint8Array(ab2), ab1.byteLength)

	return out.buffer
}