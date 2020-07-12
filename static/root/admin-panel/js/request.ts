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

		let size = 0

		// Create body

		const reqBody = stringToUint8Array(JSON.stringify(body))
		size += reqBody.byteLength

		// Create file metas

		const fileMetas: Uint8Array[] = new Array(files.length)

		for (let i = 0; i < files.length; i++) {
			const file = files[i]

			const fileMeta = stringToUint8Array(
				`\n--------------------file\n${ JSON.stringify({
					name: file.name,
					lastModified: file.lastModified,
					size: file.size,
					type: file.type
				}) }\n`
			)

			size += fileMeta.byteLength + file.size
			fileMetas.push(fileMeta)
		}

		// Create raw body

		let pointer = 0
		const rawBody = new Uint8Array(size)

		const addTobody = (data: Uint8Array) => {
			rawBody.set(data, pointer)
			pointer += data.byteLength
		}

		// Add body

		addTobody(reqBody)

		// Add each file

		for (let i = 0; i < files.length; i++) {
			const fileMeta = fileMetas[i]
			const fileData = await files[i].arrayBuffer()

			addTobody(fileMeta)
			addTobody(new Uint8Array(fileData))
		}

		req.send(rawBody)
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

const stringToUint8Array = (str: string) => {
	const arr = new Uint8Array(str.length)

	for (let i = 0; i < str.length; i++) {
		arr[i] = str.charCodeAt(i)
	}

	return arr
}