interface RequestEventListeners {
	onRequestUploadProgress?: (e: ProgressEvent<EventTarget>) => void
	onResponseDownloadProgress?: (e: ProgressEvent<EventTarget>) => void 
}

const request = (
	url: string,
	body: Object = {},
	files: File[] = [],
	eventListeners?: RequestEventListeners
): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		const req = new XMLHttpRequest()

		const formData = new FormData()

		// Append body

		formData.append('body', JSON.stringify(body))

		// Append files

		const fileMeta = {}

		for (let file of files) {
			// create meta

			fileMeta[file.name] = {
				name: file.name,
				lastModified: file.lastModified,
				size: file.size,
				type: file.type
			}

			// Append file

			formData.append(file.name, file)
		}

		// Append fileMeta

		formData.append('file-meta', JSON.stringify(fileMeta))

		req.onreadystatechange = () => {
			if (req.readyState == 4) {

				if (req.status >= 200 && req.status < 300) {
					resolve(req.response)
				} else {
					reject({ status: req.status, response: req.response })
				}
			}
		}

		// Event listeners

		if (eventListeners != null) {
			req.upload.onprogress = eventListeners.onRequestUploadProgress
			req.onprogress = eventListeners.onResponseDownloadProgress
		}

		// Send the request

		req.open('POST', url)
		req.send(formData)
	})
}

const handleRequestError = (err: { status: number, response: string }) => {
	if (err.status == 403) {
		// This should only happen on a session timeout
		// Clear the suToken

		localStorage.removeItem('su-token')

		setPadlock('locked')

		notification('Session Timed Out', `Please retry.`)
	} else {
		// This should never happen

		notification('Unhandled Error', `status code: ${ err.status }, body: <codeblock>${
			err.response
				.replace(/\n/g, '<br>')
		}</codeblock>`, null)
	}
}