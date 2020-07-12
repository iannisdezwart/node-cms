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

		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				const stringifiedBody = JSON.stringify(body)

				controller.enqueue(stringToUint8Array(stringifiedBody))

				for (let file of files) {
					controller.enqueue(stringToUint8Array(
						`\n--------------------file\n${ JSON.stringify({
							name: file.name,
							lastModified: file.lastModified,
							size: file.size,
							type: file.type
						}) }\n`
					))

					const fileStream = file.stream()
					const reader =  fileStream.getReader()

					const enqueueNextChunk = async () => {
						const chunk = await reader.read()

						if (!chunk.done) {
							controller.enqueue(chunk.value)
							enqueueNextChunk()
						}
					}

					enqueueNextChunk()
				}
			}
		})

		console.log('prepared request in ' + (Date.now() - start) + 'ms')

		req.send(stream)
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