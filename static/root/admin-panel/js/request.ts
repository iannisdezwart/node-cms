interface SocketResponse {
	status: number
	body: any
}

const request = (
	url: string,
	body: Object = {},
	files: File[] = []
): Promise<SocketResponse> => {
	return new Promise(async (resolve, reject) => {
		const socket = io({
			transportOptions: {
				polling: {
					extraHeaders: {
						path: url
					}
				}
			}
		})

		socket.on('response', (res: SocketResponse) => {
			if (res.status >= 200 && res.status < 300) {
				resolve(res)
			} else {
				reject({ status: res.status, response: res.body })
			}
		})

		// Create body

		const reqBody = stringToUint8Array(JSON.stringify(body))

		socket.emit('data', reqBody.buffer)

		// Create file metas

		for (let file of files) {
			const fileMeta = stringToUint8Array(
				`\n--------------------file\n${ JSON.stringify({
					name: file.name,
					lastModified: file.lastModified,
					size: file.size,
					type: file.type
				}) }\n`
			)

			socket.emit('data', fileMeta.buffer)

			const stream: ReadableStream<Uint8Array> = file.stream()
			const reader = stream.getReader()

			while (true) {
				const chunk = await reader.read()

				if (!chunk.done) {
					socket.emit('data', chunk.value.buffer)
				} else {
					const end = stringToUint8Array(`\n--------------------end`)
					socket.emit('data', end.buffer)
					break
				}
			}
		}
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