/* 

	===== Info about this file =====

	" This is the main TS/JS file for NodeCMS admin-panel

	Author: Iannis de Zwart (https://github.com/iannisdezwart)

	===== Table of contents =====

	1. On-load setup

	2. Common Types and Functions
		2.1 Common Types
		2.2 Common Functions

	3. Page Manager
		3.1 Show Pages
			3.1.1 Move Page Up/Down
		3.2 Edit Page
			3.2.1 Save Page
		3.3 Add Page
		3.4 Delete Page
		3.5 Page Template Input To HTML
			3.5.1 Generate .img-array-img Element
		3.6 Collect Page Template Inputs
		3.7 img[] Functions
			3.7.1 Move Image
			3.7.2 Edit Image
			3.7.3 Delete Image
			3.7.4 Add Image

	4. File Manager
		4.1 Upload Files
		4.2 Drop Area
		4.3 File Picker
			4.3.1 Create UL from files
				4.3.1.1 li.file-list-item hover animation
				4.3.1.2 li.file-list-item select handler
				4.3.1.3 Expand directory
			4.3.2 Handle submit button click
		4.4 Show Files
			4.4.1 Bulk Delete Files
			4.4.2 Bulk Copy Files
			4.4.3 Bulk Move Files
		4.5 Delete File
		4.6 Copy File and Move File
			4.6.1 Copy / Move File With Different Name
		4.7 Rename File
		4.8 Create New Directory

*/

/* ===================
	1. On-load setup
=================== */

window.onload = () => {
	const username = Cookies.get('username')

	if (username == undefined) {
		// Go to login page

		document.location.pathname = '/admin-panel/login.html'
	} else {
		// Set the greeting

		const greetingLI = $('#greeting') as HTMLLIElement
		greetingLI.innerText = `Welcome, ${ Cookies.get('username') }!`
	}

	goToTheRightPage()
}

/* ===================
	2. Common Types and Functions
=================== */

declare namespace tinymce {
	export function init(obj: Object): void
}

declare namespace tinyMCE {
	export function get(any: any): any
}

const initTinyMCE = () => {
	tinymce.init({
		selector: 'textarea',
		plugins: [
			'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking table emoticons template paste help'
		],
		toolbar: 'undo redo | styleselect | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image emoticons | print preview fullpage | help',
		menubar: 'edit insert format table help',
		skin: "snow",
		height: "400"
	})

	return ''
}

/*

	2.1 Common Types

*/

let db: DB

interface DB {
	pageTypes: PageType[]
	pages: Page[]
}

interface PageType {
	name: string
	template: PageTemplate
	canAdd: boolean
}

interface PageTemplate {
	[key: string]: ContentType
}

type ContentType = 'string' | 'text' | 'img[]'

interface Page {
	id: number
	pageType: string
	pageContent: PageContent
}

interface PageContent {
	[key: string]: any
}

/*

	2.2 Common Functions

*/

const fetchPages = () => {
	return new Promise((resolve, reject) => {
		request('/admin-panel/workers/get-pages.node.js', {
			token: Cookies.get('token')
		})
			.then(res => {
				db = res.body
				resolve()
			})
			.catch(res => {
				reject(res)
			})
	})
}

const pageHistory: Stack<string> = new Stack()
pageHistory.push(window.location.origin + '/admin-panel/')

const setSearchParams = (params: Object) => {
	let newSearchQuery = '?'

	for (let paramName in params) {
		const paramValue = params[paramName]

		newSearchQuery += `${ paramName }=${ paramValue.toString() }&`
	}

	// Remove trailing ampersand

	newSearchQuery = newSearchQuery.substring(0, newSearchQuery.length - 1)

	const newURL = window.location.origin + window.location.pathname + newSearchQuery

	// Set the URL of the page without reloading it

	window.history.pushState({ path: newURL }, '', newURL)

	// Save new URL in pageHistory

	pageHistory.push(window.location.href)
}

const goBackInHistory = () => {
	if (pageHistory.size > 1) {
		pageHistory.pop()
	}

	if (pageHistory.size > 0) {
		const prevUrl = pageHistory.pop()

		// Set the URL of the page without reloading it

		window.history.pushState({ path: prevUrl }, '', prevUrl)
		goToTheRightPage()
	}
}

const goToTheRightPage = () => {
	const searchParams = new URLSearchParams(document.location.search)
	const tab = searchParams.get('tab')

	if (tab == null) {
		goToHomepage()
	} else {
		if (tab == 'pages') {
			showPages()
		} else if (tab == 'edit-page') {
			const pageId = parseInt(searchParams.get('page-id'))

			if (pageId == null) {
				showPages()
			} else {
				editPage(pageId)
			}
		} else if (tab == 'delete-page') {
			const pageId = parseInt(searchParams.get('page-id'))

			if (pageId == null) {
				showPages()
			} else {
				deletePage(pageId)
			}
		} else if (tab == 'add-page') {
			const pageType = searchParams.get('page-type')
			
			if (pageType == null) {
				showPages()
			} else {
				addPage(pageType)
			}
		} else if (tab == 'file-manager') {
			const path = searchParams.get('path')

			showFiles(path)
		}
	}
}

const goToHomepage = () => {
	// Todo: make homepage

	$('.main').innerHTML = /* html */ `
		
	`
}

const reduceArray = <T>(
	arr: Array<T>,
	f: (currentKey: T, i?: number) => string
) => {
	let output = ''

	for (let i = 0; i < arr.length; i++) {
		output += f(arr[i], i)
	}

	return output
}

const reduceObject = (
	obj: Object,
	f: (currentKey: string) => string
) => {
	let output = ''
	
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) {
			output += f(i)
		}		
	}

	return output
}

const showLoader = () => {
	$('.main').innerHTML = /* html */ `
		<div class="loader"></div>
	`
}

/* ===================
	3. Page Manager
=================== */

/*

	3.1 Show Pages

*/

const showPages = () => {
	showLoader()

	fetchPages()
		.then(() => {
			const { pages, pageTypes } = db

			$('.main').innerHTML = /* html */ `
				<ul class="pages">
					${
						reduceArray(pageTypes, pageType => {
							const pagesOfCurrentType = pages.filter(
								page => page.pageType == pageType.name
							)

							return /* html */ `
							<li>
								<h1>${ captitalise(pageType.name) }:</h1>
								<table class="pages">
									<thead>
										<tr>
											<td>Page Title:</td>
										</tr>
									</thead>
									<tbody>
										${
											reduceArray(pagesOfCurrentType, (page, i) => /* html */ `
												<tr>
													<td><span>${ page.pageContent.title }</span></td>
													<td>
														<button class="small" onclick="editPage(${ page.id })">Edit</button>
														${ (pageType.canAdd) ? /* html */ `
															<button class="small red" onclick="deletePage(${ page.id })">Delete</button>
														` : '' }
													</td>
													<td>
														${ (i != 0) ? /* html */ `
															<img class="clickable-icon" src="/admin-panel/img/arrow-up.png" alt="up" title="move up" style="margin-right: .5em" onclick="movePage('UP', '${ pageType.name }', ${ i })">
														` : '' }
													</td>
													<td>
														${ (i != pagesOfCurrentType.length - 1) ? /* html */ `
															<img class="clickable-icon" src="/admin-panel/img/arrow-down.png" alt="down" title="move down" onclick="movePage('DOWN', '${ pageType.name }', ${ i })">
														` : '' }
													</td>
												</tr>
											`)
											+
											(() => (pageType.canAdd) ? /* html */ `
												<tr>
													<td>
														<button class="small" onclick="addPage('${ pageType.name }')">Add page</button>
													</td>
												</tr>
											` : '')()
										}
									</tbody>
								</table>
							</li>
						`})
					}
				</ul>
			`

			// 3.1.1 Move Page Up/Down

			;(window as any).movePage = async (
				direction: 'UP' | 'DOWN',
				pageTypeName: string,
				index: number
			) => {
				const pagesOfCurrentType = pages.filter(
					_page => _page.pageType == pageTypeName
				)

				const page1 = pagesOfCurrentType[index]
				const page2 = (direction == 'UP')
					? pagesOfCurrentType[index - 1]
					: pagesOfCurrentType[index + 1]

				const suToken = await getSuToken()

				if (suToken == undefined) {
					// User cancelled

					throw new Error(`User cancelled`)
				}

				await request('/admin-panel/workers/swap-pages.node.js', {
					suToken, page1, page2
				})
					.catch(handleRequestError)

				showPages()
			}
			
			setSearchParams({
				tab: 'pages'
			})
		})
		.catch(res => {
			if (res.status == 403) {
				document.location.pathname = '/admin-panel/login.html'
			} else {
				// This should never happen

				notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
			}
		})
}

/*

	3.2 Edit Page

*/

const editPage = (id: number) => {
	showLoader()

	fetchPages()
		.then(() => {
			const page = db.pages.find(el => el.id == id)
			const { template } = db.pageTypes.find(el => el.name == page.pageType)
		
			$('.main').innerHTML = /* html */ `
				<h1>Editing page "${ page.pageContent.title }"</h1>
		
				${
					reduceObject(template, input => /* html */ `
						<br/><br/>
						<h2>${ input }:</h2>
						${ pageTemplateInputToHTML(template[input], input, page.pageContent[input]) }
					`)
				}
		
				<br/><br/>
				<button id="submit-changes" onclick="handleSubmit()">Save Page</button>
			`

			// 3.2.1 Save Page

			const savePage = async (
				pageContent: PageContent,
				pageId: number
			) => {
				const suToken = await getSuToken()

				if (suToken == undefined) {
					// User cancelled

					throw new Error(`User cancelled`)
				}

				await request('/admin-panel/workers/update-page.node.js', {
					suToken, pageContent, pageId
				})
					.catch(err => {
						handleRequestError(err)
						throw err
					})
			}

			;(window as any).handleSubmit = (keepEditing = false) => {
				const pageContent = collectInputs(template)

				savePage(pageContent, page.id)
					.then(() => {
						notification('Saved page', `Successfully saved page "${ page.pageContent.title }"!`)
							
						if (!keepEditing) {
							showPages()
						}
					})
			}

			setSearchParams({
				tab: 'edit-page',
				'page-id': page.id
			})

			initTinyMCE()
		})
		.catch(res => {
			if (res.status == 403) {
				document.location.pathname = '/admin-panel/login.html'
			} else {
				// This should never happen

				notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
			}
		})
}

/*

	3.3 Add Page

*/

const addPage = (pageType: string) => {
	showLoader()

	fetchPages()
		.then(() => {
			const { template } = db.pageTypes.find(el => el.name == pageType)
			
			$('.main').innerHTML = /* html */ `
				<h1>Creating new page of type "${ pageType }"</h1>
		
				${
					reduceObject(template, (input: string) => /* html */ `
						<br/><br/>
						<h2>${ input }:</h2>
						${ pageTemplateInputToHTML(template[input], input, '') }
					`)
				}
		
				<br/><br/>
				<button id="add-page" onclick="handleSubmit('${ pageType }')">Add Page</button>
			`

			;(window as any).handleSubmit = () => {
				const pageContent = collectInputs(template)

				getSuToken()
					.then(suToken => {
						request('/admin-panel/workers/add-page.node.js', {
							suToken, pageType, pageContent
						})
							.then(() => {
								notification('Added page', `Successfully added page "${ pageContent.title }"!`)

								showPages()
							})
							.catch(handleRequestError)
					})
			}
		
			initTinyMCE()

			setSearchParams({
				tab: 'add-page',
				'page-type': pageType
			})
		})
		.catch(res => {
			if (res.status == 403) {
				document.location.pathname = '/admin-panel/login.html'
			} else {
				// This should never happen

				notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
			}
		})
}

/*

	3.4 Delete Page

*/

const deletePage = (id: number) => {
	showLoader()

	fetchPages()
		.then(() => {
			const page = db.pages.find(el => el.id == id)

			$('.main').innerHTML = /* html */ `
				<h1>Deleting page "${ page.pageContent.title }"</h1>

				<p>Are you sure you want to delete this page?</p>

				<br/><br/>
				<button id="delete-page" onclick="handleSubmit()">Delete Page</button>
				`

				;(window as any).handleSubmit = () => {
					getSuToken()
						.then(suToken => {
							request('/admin-panel/workers/delete-page.node.js', {
								suToken,
								pageId: page.id
							})
								.then(() => {
									notification('Deleted page', `Successfully deleted page "${ page.pageContent.title }"!`)
		
									showPages()
								})
								.catch(handleRequestError)
						})
				}

				setSearchParams({
					tab: 'delete-page',
					'page-id': id
				})
		})
		.catch(res => {
			if (res.status == 403) {
				document.location.pathname = '/admin-panel/login.html'
			} else {
				// This should never happen

				notification('Unspecified Error', `status code: ${ res.status }, body: <code>${ res.response }</code>`)
			}
		})
}

/*

	3.5 Page Template Input To HTML

*/

type PageTemplateInputType = 'text' | 'string' | 'img[]'

const pageTemplateInputToHTML = (
	inputType: PageTemplateInputType,
	inputName: string,
	inputContent: any
) => {
	if (inputType == 'text') {
		// text

		return /* html */ `
		<textarea id="${ inputName }" data-input="${ inputName }">
			${ inputContent }
		</textarea>
		`
	} else if (inputType == 'string') {
		// string

		return /* html */ `
			<input id="${ inputName }" data-input="${ inputName }" type="text" value="${ inputContent }" />
		`
	} else if (inputType == 'img[]') {
		// img[]

		const imgs = inputContent as string[]

		return /* html */ `
			<div class="img-array" id="${ inputName }" data-input="${ inputName }">
				${
					reduceArray(imgs, (img, i) =>
						generateImgArrayImg(img, (i != 0), (i != imgs.length - 1))
					)
				}
				<div class="img-array-plus" onclick="addImg('${ inputName }')"></div>
			</div>
		`
	}
}

// 3.5.1 Generate .img-array-img Element

const generateImgArrayImg = (
	imgSrc: string,
	hasLeftArrow: boolean,
	hasRightArrow: boolean
) => /* html */ `
	<div class="img-array-img">
		<div class="img-array-img-options">
			<button class="small light" onclick="editImg(this)">Edit</button>
			<button class="small light red" onclick="deleteImg(this)">Delete</button>
		</div>
		<div class="img-array-img-arrows">
			${ (hasLeftArrow) ? /* html */ `
				<img class="arrow-left" src="/admin-panel/img/arrow-left.png" alt="arrow-left" onclick="moveImg('left', this)">
			` : '' }
			${ (hasRightArrow) ? /* html */ `
				<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImg('right', this)">
			` : '' }
		</div>
		<img class="img" data-path="${ imgSrc }" src="${ imgSrc }">
	</div>
`

/*

	3.6 Collect Page Template Inputs

*/

const collectInputs = (template: PageTemplate) => {
	// Get all input elements

	const elements = document.querySelectorAll<HTMLInputElement>('[data-input]')
	const pageContent: PageContent = {}

	// Parse inputs

	for (let i = 0; i < elements.length; i++) {
		const inputKey = elements[i].getAttribute('data-input')
		const inputType = template[inputKey]
		let inputValue: any

		if (inputType == 'text') {
			inputValue = tinyMCE.get(inputKey).getContent()
		} else if (inputType == 'string') {
			inputValue = elements[i].value.trim()
		} else if (inputType == 'img[]') {
			inputValue = []
			const imgs = elements[i].querySelectorAll<HTMLImageElement>('.img')

			for (let j = 0; j < imgs.length; j++) {
				inputValue[j] = imgs[j].getAttribute('data-path')
			}
		}

		pageContent[inputKey] = inputValue
	}

	return pageContent
}

/*

	3.7 img[] Functions

*/

// 3.7.1 Move Image

const moveImg = async (
	direction: 'left' | 'right',
	arrowEl: HTMLImageElement
) => {
	const imgArrayImgEl = arrowEl.parentElement.parentElement

	// Swap images visually

	// Get the first image element that has to move

	const imgEl1 = imgArrayImgEl.querySelector<HTMLImageElement>('.img')

	// Get the other image element

	const imgEl2 = (direction == 'left')
		? imgArrayImgEl.previousElementSibling.querySelector<HTMLImageElement>('.img')
		: imgArrayImgEl.nextElementSibling.querySelector<HTMLImageElement>('.img')

	// Swap the images

	imgEl2.parentElement.appendChild(imgEl1)
	imgArrayImgEl.appendChild(imgEl2)
}

// 3.7.2 Edit Image

const editImg = async (
	buttonEl: HTMLButtonElement
) => {
	// Select a new image

	const newImgPath = await filePicker({
		type: 'file',
		title: 'Edit image',
		body: 'Select a new image',
		buttonText: 'Select',
		extensions: imageExtensions
	}, false)
		.catch(() => {
			throw new Error(`User cancelled`)
		})

	// Update the old image
	// Todo: show loader while image is loading

	const imgEl = buttonEl.parentElement.parentElement.querySelector<HTMLImageElement>('.img')

	imgEl.setAttribute('data-path', `/content${ newImgPath }`)
	imgEl.src = `/content${ newImgPath }`
}

// 3.7.3 Delete Image

const deleteImg = async (
	buttonEl: HTMLButtonElement
) => {
	const imgArrayImgEl = buttonEl.parentElement.parentElement

	// Get left and right imgs (which can be null)

	const leftImgEl = imgArrayImgEl.previousElementSibling
	const rightImgEl = imgArrayImgEl.nextElementSibling

	// Remove the image

	imgArrayImgEl.remove()

	// Update the arrows of the left and right imgs if necessary

	if (leftImgEl == null) {
		rightImgEl.querySelector('.arrow-left').remove()
	}

	if (rightImgEl != null) {
		if (!rightImgEl.classList.contains('img-array-img')) {
			leftImgEl.querySelector('.arrow-right').remove()
		}
	}
}

// 3.7.4 Add Image

const addImg = async (
	inputName: string
) => {
	// Select a new image

	const newImgPath = await filePicker({
		type: 'file',
		title: 'Add image',
		body: 'Select a new image',
		buttonText: 'Select',
		extensions: imageExtensions
	}, false)
		.catch(() => {
			throw new Error(`User cancelled`)
		})

	// Get the .img-array-plus element

	const imgArrayPlus = $(`[data-input="${ inputName }"`).querySelector<HTMLDivElement>('.img-array-plus')

	// Add the image before it

	imgArrayPlus.insertAdjacentHTML(
		'beforebegin',
		generateImgArrayImg(`/content${ newImgPath }`, (imgArrayPlus.previousElementSibling != null), false)
	)

	// Add a right arrow to the previous image if it exists

	const prevImgArrayImg = imgArrayPlus.previousElementSibling.previousElementSibling

	if (prevImgArrayImg != null) {
		prevImgArrayImg.querySelector('.img-array-img-arrows').innerHTML += /* html */ `
			<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImg('right', this)">
		`
	}
}

/* ===================
	4. File Manager
=================== */

/*

	4.1 Upload Files

*/

const uploadFiles = (
	fileList: FileList,
	path = '/'
) => new Promise<SocketResponse>(resolve => {
	getSuToken()
		.then(suToken => {
			const files: File[] = []
		
			const body = {
				suToken,
				path
			}
		
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i]
		
				// Add each file to the files array
		
				files.push(file)
			}
		
			// Send the request
		
			request('/admin-panel/workers/fileupload.node.js', body, files)
				.then(resolve)
				.catch(handleRequestError)
		})
})

/*

	4.2 Drop Area

*/

const initDropArea = (path = '/') => new Promise(resolve => {
	const dropArea = $('.drop-area') as HTMLDivElement

	const hiddenUploadInput = document.createElement('input')
	hiddenUploadInput.type = 'file'
	hiddenUploadInput.multiple = true
	hiddenUploadInput.style.visibility = 'hidden'
	hiddenUploadInput.onchange = () => {
		uploadFiles(hiddenUploadInput.files, path)
			.then(resolve)
	}

	dropArea.appendChild(hiddenUploadInput)

	const preventDefaults = (e: Event) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const highlight = () => {
		dropArea.classList.add('highlighted')
	}

	const unhighlight = () => {
		dropArea.classList.remove('highlighted')
	}

	const drop = (e: DragEvent) => {
		const { dataTransfer } = e
		const { files } = dataTransfer

		// Todo: upload folders https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree

		uploadFiles(files, path)
			.then(resolve)
	}

	;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
		dropArea.addEventListener(event, preventDefaults, false)
	})

	;['dragenter', 'dragover'].forEach(event => {
		dropArea.addEventListener(event, highlight, false)
	})

	;['dragleave', 'drop'].forEach(event => {
		dropArea.addEventListener(event, unhighlight, false)
	})

	dropArea.addEventListener('drop', drop, false)
})

interface _File {
	name: string
	path: string
	isDirectory: boolean
	filesInside: number
	size: number
	modified: string
}

/*

	4.3 File Picker

*/

interface FilePickerOptions {
	type?: 'file' | 'directory' | 'new-file'
	title: string
	body: string
	buttonText: string,
	newFileName?: string,
	extensions?: Set<string>
}

type FilePickerOverload = {
	(options: FilePickerOptions, multiple: true): Promise<string[]>
	(options: FilePickerOptions, multiple: false): Promise<string>
}

const filePicker: FilePickerOverload = (
	options: FilePickerOptions,
	multiple?: boolean
) => new Promise<any>((resolveFilePicker, rejectFilePicker) => {
	// Set defaults

	options = {
		...{
			type: 'file',
			newFileName: 'new-file-name.txt',
			extensions: null
		},
		...options
	}

	// Create HTML Element

	const filePickerEl = document.createElement('div')

	filePickerEl.classList.add('popup')

	filePickerEl.innerHTML = /* html */ `
		<a class="popup-close-button">✕</a>
		<h1 class="popup-title">${ options.title }</h1>
		${
			(options.body != undefined) ? /* html */ `
				<p class="popup-body">${ options.body }</p>
			` : ''
		}
		<div class="file-list-container">
			<ul class="file-list file-list-root">
				<li class="file-list-item file-list-root" onclick="selectLI(this)" onmouseover="hoverLI(this)" onmouseleave="hoverLI(this, false)" data-path="/">
					<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/dir.png" alt="dir" onerror="
						this.src = '${ `/admin-panel/img/file-icons/unknown.png` }'; this.onerror = null
					">
					/
				</li>
			</ul>
		</div>
		${
			(options.type == 'new-file') ? /* html */ `
				<p>Fill in the name of the file</p>
				<input type="text" class="filepicker-new-file" value="${ options.newFileName }" placeholder="Enter new file name...">
			` : ''
		}
		<br><br>
		<button class="small">${ options.buttonText }</button>
	`

	// 4.3.1 Create UL from files

	const createULFromFiles = (path: string) => new Promise<HTMLUListElement>(resolve => {
		getFiles(path)
			.then(files => {
				// Filter only directories if needed

				if (options.type == 'directory' || options.type == 'new-file') {
					files = files.filter(file => file.isDirectory)
				}

				// Filter extensions if needed

				if (options.extensions != null) {
					files = files.filter(file =>
						options.extensions.has(getExtension(file.name)) || file.isDirectory
					)
				}

				// Create file-list UL
	
				const fileListEl = document.createElement('ul')

				fileListEl.classList.add('file-list')
				
				// Add each file to the file-list UL
	
				for (let file of files) {
					const { name } = file
	
					const extension = (file.isDirectory)
						? 'dir'
						: name.slice(name.lastIndexOf('.') + 1)
					
					// Create the child LI
	
					fileListEl.innerHTML += /* html */ `
						<li class="file-list-item" onclick="selectLI(this)" onmouseover="hoverLI(this)" onmouseleave="hoverLI(this, false)" data-path="${
							(file.isDirectory) ? path + file.name + '/' : path + file.name
						}">
							${
								(file.isDirectory) ? `<span class="plus-button" data-expanded="false" onclick="expandDirectory(this)"></span>`: ''
							}
							<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/${ extension }.png" alt="${ extension }" onerror="
								this.src = '${ `/admin-panel/img/file-icons/unknown.png` }'; this.onerror = null
							">
							${ file.name }
						</li>
					`
				}

				// 4.3.1.1 li.file-list-item hover animation

				(window as any).hoverLI = (li: HTMLLIElement, hover = true) => {
					if (event.target != li) return

					if (hover) {
						li.classList.add('hover')

						const hoverChangeEvent = new CustomEvent('hoverchange', {
							detail: {
								target: li
							}
						})

						dispatchEvent(hoverChangeEvent)
						
						addEventListener('hoverchange', (
							e: CustomEventInit<{ target: HTMLLIElement }>
						) => {
							if (e.detail.target != li) {
								li.classList.remove('hover')
							}
						})
					} else {
						li.classList.remove('hover')
					}
				}

				// 4.3.1.2 li.file-list-item select handler

				(window as any).selectLI = (li: HTMLLIElement) => {
					if (event.target != li) return

					if (li.getAttribute('data-selected') == 'true') {
						li.classList.remove('selected')
						li.setAttribute('data-selected', 'false')
					} else {
						li.classList.add('selected')
						li.setAttribute('data-selected', 'true')

						const hoverChangeEvent = new CustomEvent('selectionchange', {
							detail: {
								newlySelected: li
							}
						})

						dispatchEvent(hoverChangeEvent)

						addEventListener('selectionchange', (
							e: CustomEventInit<{ newlySelected: HTMLLIElement }>
						) => {
							if (e.detail.newlySelected != li && !multiple) {
								li.classList.remove('selected')
								li.setAttribute('data-selected', 'false')
							}
						})
					}
				}

				// 4.3.1.3 Expand directory

				(window as any).expandDirectory = (button: HTMLSpanElement) => {
					const li = button.parentElement

					const directoryPath = li.getAttribute('data-path')
					const expanded = button.getAttribute('data-expanded')

					if (expanded == 'true') {
						li.querySelector('ul.file-list').remove()
						button.setAttribute('data-expanded', 'false')

						// Decrement the margin of all parents

						const childElementCount = parseInt(getComputedStyle(li).getPropertyValue('--files-inside'))
						let currentLi = li

						while (true) {
							const filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'))

							// Decrement files inside

							currentLi.style.setProperty('--files-inside', (filesInside - childElementCount).toString())

							// Traverse backwards

							currentLi = currentLi.parentElement.parentElement
							
							// Break if we reached the root

							if (!currentLi.classList.contains('file-list-item')) {
								break
							}
						}
					} else {
						// Todo: show loader

						createULFromFiles(directoryPath)
							.then(ul => {
								li.appendChild(ul)

								// Increment the margin of all parents

								let currentLi = li
								const { childElementCount } = ul

								while (true) {
									const filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'))

									// Increment files inside

									currentLi.style.setProperty('--files-inside', (filesInside + childElementCount).toString())
									
									// Traverse backwards

									currentLi = currentLi.parentElement.parentElement
																
									// Break if we reached the root

									if (!currentLi.classList.contains('file-list-item')) {
										break
									}
								}
							})

						button.setAttribute('data-expanded', 'true')
					}
				}

				resolve(fileListEl)
			})
			.catch(handleRequestError)
	})

	// Append the File Picker UL to the popup

	createULFromFiles('/')
		.then(ul => {
			filePickerEl.querySelector('li.file-list-root').appendChild(ul)

			// Set --files-inside for li.file-list-root

			const rootLI = filePickerEl.querySelector<HTMLLIElement>('li.file-list-root')
			rootLI.style.setProperty('--files-inside', (ul.childElementCount).toString())
		})

	const removePopup = () => {
		filePickerEl.classList.add('closed')
		setTimeout(() => {
			filePickerEl.remove()
		}, 300)
	}

	// 4.3.2 Handle submit button click

	filePickerEl.querySelector('button').addEventListener('click', () => {
		removePopup()

		// Get all selected files

		const lis = filePickerEl.querySelectorAll('li.file-list-item')
		const filePaths: string[] = []

		lis.forEach(li => {
			if (li.classList.contains('selected')) {
				let path = li.getAttribute('data-path')

				if (options.type == 'new-file') {
					path += filePickerEl.querySelector<HTMLInputElement>('.filepicker-new-file').value
				}

				filePaths.push(path)
			}
		})

		// Reject if there are no files, else resolve

		if (filePaths.length == 0) {
			rejectFilePicker()
		} else {
			if (multiple) {
				resolveFilePicker(filePaths)
			} else {
				resolveFilePicker(filePaths[0])
			}
		}
	})

	// Add popup to page

	document.body.appendChild(filePickerEl)

	// Close popup when x button or escape is pressed

	filePickerEl.querySelector('a.popup-close-button').addEventListener('click', () => {
		removePopup()
		rejectFilePicker()
	})

	const escapePressHandler = (e: KeyboardEvent) => {
		if (e.key == 'Escape') {
			removePopup()
			removeEventListener('keyup', escapePressHandler)
		}
	}

	addEventListener('keyup', escapePressHandler)
})

/*

	4.4 Show Files

*/

const getFiles = (path = '/') => new Promise<_File[]>((resolve, reject) => {
	request('/admin-panel/workers/get-files.node.js', {
		path,
		token: Cookies.get('token')
	})
		.then(res => {
			const fileArray = res.body.files as _File[]
			resolve(fileArray)
		})
		.catch(res => {
			reject(res)
		})
})

const upALevel = (path: string) => {
	if (path.length <= 1) {
		return path
	}

	// Remove trailing slash

	path = path.substring(0, path.length - 1)
	const lastSlash = path.lastIndexOf('/')

	return path.substring(0, lastSlash + 1)
}

const openFile = (path: string) => {
	window.open(`/content${ path }`)
}

let checkboxStatus = 'unchecked'
let checkedCheckboxes = 0

const allCheckboxesChecked = () => {
	const checkboxes = $a('tbody .col-checkbox input[type="checkbox"]') as NodeListOf<HTMLInputElement>

	for (let i = 0; i < checkboxes.length; i++) {
		if (!checkboxes[i].checked) {
			return false
		}
	}

	return true
}

const checkAllCheckboxes = (check = true) => {
	const checkboxes = $a('tbody .col-checkbox input[type="checkbox"]') as NodeListOf<HTMLInputElement>

	if (check) {
		checkboxStatus = 'checked'
	} else {
		checkboxStatus = 'unchecked'
	}

	checkboxes.forEach(checkbox => {
		if (checkbox.checked != check) {
			checkbox.checked = check
			checkbox.onchange(new Event('change'))
		}
	})
}

const uncheckAllCheckboxes = () => checkAllCheckboxes(false)

const toggleAllCheckboxes = () => {
	if (allCheckboxesChecked()) {
		uncheckAllCheckboxes()
	} else {
		checkAllCheckboxes()
	}
}

const showFiles = (path = '/') => {
	showLoader()

	setSearchParams({
		tab: 'file-manager',
		path
	})

	getFiles(path)
		.then(files => {
			files.sort(file => file.isDirectory ? -1 : 1)

			$('.main').innerHTML = /* html */ `
				<div class="drop-area">
					<h1>Folder: ${ path }</h1>

					<button class="small" onclick="showFiles(upALevel('${ path }'))">Up a level</button>
					<button class="small" onclick="$('input[type=file]').click()">Upload Files</button>
					<button class="small" onclick="createNewDirectory('${ path }')">New Folder</button>
					<span class="bulk-actions hidden">
						Selected Files:
						<button class="small" onclick="bulkCopyFiles()">Copy</button>
						<button class="small" onclick="bulkMoveFiles()">Move</button>
						<button class="small red" onclick="bulkDeleteFiles()">Delete</button>
					</span>

					<br><br>

					<table class="files">

						<thead>
							<tr>
								<td class="col-checkbox">
									<input type="checkbox" onclick="toggleAllCheckboxes()" title="Select all">
								</td>
								<td class="col-icon"></td>
								<td class="col-name">Name</td>
								<td class="col-size">Size</td>
								<td class="col-modified">Modified</td>
								<td class="col-options"></td>
							</tr>
						</thead>

						<tbody>
							${
								reduceArray(files, file => {
									const { name } = file
									const size = file.isDirectory ? '–' : parseSize(file.size)
									const modified = parseDate(file.modified)

									const extension = (file.isDirectory)
										? 'dir'
										: name.slice(name.lastIndexOf('.') + 1)

									;(window as any).toggleDropdown = (
										el: HTMLDivElement,
										e: MouseEvent
									) => {
										const isDescendant = (child: HTMLElement, parent: HTMLElement) => {
											while (child != null) {
												if (child == parent) {
													return true
												}
												child = child.parentElement
											}

											return false
										}

										if (el == e.target) {
											el.classList.toggle('active')
										}

										setTimeout(() => {
											const handler = (mouseEvent: MouseEvent) => {
												if (!isDescendant(mouseEvent.target as HTMLElement, el)) {
													el.classList.remove('active')
													document.removeEventListener('click', handler)
												}
											}

											document.addEventListener('click', handler)
										}, 0)
									}
									
									let bulkFileActionsShown = false

									const showBulkFileActions = () => {
										bulkFileActionsShown = true
										$('span.bulk-actions').classList.remove('hidden')
									}

									const hideBulkFileActions = () => {
										bulkFileActionsShown = false
										$('span.bulk-actions').classList.add('hidden')
									}

									;(window as any).handleFileCheckboxes = (checkboxEl: HTMLInputElement) => {
										const selectAllCheckbox = $('thead .col-checkbox input[type="checkbox"]') as HTMLInputElement

										if (checkboxEl.checked) {
											checkedCheckboxes++

											// Check 'select all' checkbox if necessary

											if (checkedCheckboxes == files.length) {
												selectAllCheckbox.checked = true
											}
										} else {
											checkedCheckboxes--

											// Uncheck 'select all' checkbox if necessary

											if (checkedCheckboxes == files.length - 1) {
												selectAllCheckbox.checked = false
											}
										}

										if (checkedCheckboxes > 0) {
											if (!bulkFileActionsShown) {
												showBulkFileActions()
											}
										} else {
											hideBulkFileActions()
										}
									}

									const getSelectedFiles = () => {
										const tableRows = $a('tr.file-row')
										const selectedFiles: _File[] = []

										for (let i = 0; i < tableRows.length; i++) {
											const checkboxEl = tableRows[i].querySelector<HTMLInputElement>('input[type="checkbox"]')

											if (checkboxEl.checked) {
												selectedFiles.push(files[i])
											}
										}

										return selectedFiles
									}

									// 4.4.1 Bulk Delete Files

									;(window as any).bulkDeleteFiles = () => {
										const selectedFiles = getSelectedFiles()

										popup(
											'Deleting multiple files',
											`Are you sure you want to delete ${ numifyNoun(selectedFiles.length, 'file', 'files') }?
											<codeblock>${ reduceArray(selectedFiles, f => f.name + '<br>') }</codeblock>`,
											[
												{
													name: 'Delete',
													classes: [ 'red' ]
												},
												{
													name: 'Cancel'
												},
											]
										)
											.then(popupRes => {
												if (popupRes.buttonName == 'Delete') {
													getSuToken()
														.then(suToken => {
															const filePaths = selectedFiles.map(f => path + f.name)

															request('/admin-panel/workers/delete-multiple-files.node.js', {
																suToken,
																filePaths
															})
																.then(() => {
																	// Refresh files

																	showFiles(path)
																})
																.catch(handleRequestError)
														})
												}
											})
											.catch(() => {
												// User cancelled
											})
									}

									// 4.4.2 Bulk Copy Files

									;(window as any).bulkCopyFiles = () => {
										const selectedFiles = getSelectedFiles()

										filePicker({
											type: 'directory',
											title: 'Copy files',
											body: 'Select a folder to where you want to copy the files',
											buttonText: 'Select folder'
										}, false)
											.then(selectedFolder => {

												getSuToken()
													.then(suToken => {
														request('/admin-panel/workers/copy-files.node.js', {
															suToken,
															sources: selectedFiles.map(
																selectedFile => selectedFile.path
															),
															destination: selectedFolder
														})
															.then(() => {
																notification(
																	'Copied Files',
																	`Succesfully copied ${ numifyNoun(selectedFiles.length, 'file', 'files') } to <code>${ selectedFolder }</code>`
																)

																// Refresh files

																showFiles(path)
															})
															.catch(res => {
																// This should never happen

																notification(
																	'Unspecified Error',
																	`status code: ${ res.status }, body: <code>${ res.response }</code>`
																)
															})
													})
											})
											.catch(() => {
												// User cancelled
											})
									}

									// 4.4.3 Bulk Move Files

									;(window as any).bulkMoveFiles = () => {
										const selectedFiles = getSelectedFiles()

										filePicker({
											type: 'directory',
											title: 'Move Files',
											body: 'Select a folder to where you want to move the files',
											buttonText: 'Select folder'
										}, false)
											.then(selectedFolder => {

												getSuToken()
													.then(suToken => {
														request('/admin-panel/workers/move-files.node.js', {
															suToken,
															sources: selectedFiles.map(
																selectedFile => selectedFile.path
															),
															destination: selectedFolder
														})
															.then(() => {
																notification(
																	'Moved Files',
																	`Succesfully moved ${ numifyNoun(selectedFiles.length, 'file', 'files') } to <code>${ selectedFolder }</code>`
																)

																// Refresh files

																showFiles(path)
															})
															.catch(res => {
																// This should never happen

																notification(
																	'Unspecified Error',
																	`status code: ${ res.status }, body: <code>${ res.response }</code>`
																)
															})
													})
											})
											.catch(() => {
												// User cancelled
											})
									}

									return /* html */ `
										<tr class="file-row">
											<td class="col-checkbox">
												<input type="checkbox" onchange="handleFileCheckboxes(this)">
											</td>

											<td class="col-icon">
												<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/${ extension }.png" alt="${ extension }" onerror="
													this.src = '${ `/admin-panel/img/file-icons/unknown.png` }'; this.onerror = null
												">
											</td>

											<td class="col-name" onclick="
												${ file.isDirectory } ? showFiles('${ path + file.name }/') : openFile('${ path + file.name }')
											">
												${ file.name }
											</td>

											<td class="col-size">
												${ file.isDirectory ? file.filesInside + ' items' : size }
											</td>

											<td class="col-modified">
												${ modified }
											</td>

											<td class="col-options">
												<div class="dropdown-menu" onclick="toggleDropdown(this, event)">
													<div class="dropdown-menu-content">
														<button class="small" onclick="copyFile('${ path + file.name }')">Copy</button>
														<br><br>
														<button class="small" onclick="moveFile('${ path + file.name }')">Move</button>
														<br><br>
														<button class="small" onclick="renameFile('${ path + file.name }')">Rename</button>
														<br><br>
														<button class="small red" onclick="deleteFile('${ path + file.name }')">Delete</button>
													</div>
												</div>
											</td>
										</tr>
									`
								})
							}
						</tbody>

					</table>
				</div>
			`

			initDropArea(path)
				.then(() => {
					// On file upload, refresh files

					showFiles(path)
				})
		})
		.catch(handleRequestError)
}

/*

	4.5 Delete File

*/

const deleteFile = (filePath: string) => {
	popup(
		'Deleting file',
		`Are you sure you want to delete file: <code>${ filePath }</code>?`,
		[
			{
				name: 'Delete',
				classes: [ 'red' ]
			},
			{
				name: 'Cancel'
			},
		]
	)
		.then(popupRes => {
			if (popupRes.buttonName == 'Delete') {
				getSuToken()
					.then(suToken => {
						request('/admin-panel/workers/delete-file.node.js', {
							suToken,
							filePath
						})
							.then(() => {
								showFiles(new URLSearchParams(document.location.search).get('path'))
							})
							.catch(handleRequestError)
					})
			}
		})
		.catch(() => {
			// User cancelled
		})
}

/*

	4.6 Copy File and Move File

*/

const copyFile = (sourcePath: string) => copyOrMoveFile(sourcePath, 'copy')

const moveFile = (sourcePath: string) => copyOrMoveFile(sourcePath, 'move')

// 4.6.1 Copy / Move File With Different Name

const copyOrMoveFile = async (
	sourcePath: string,
	mode: 'copy' | 'move'
) => {
	try {
		const destinationPath = await filePicker({
			type: 'new-file',
			title: `${ captitalise(mode) } File`,
			body: `Select a folder to where you want to ${ mode } the file`,
			buttonText: 'Select folder',
			newFileName: sourcePath.substring(sourcePath.lastIndexOf('/') + 1)
		}, false)

		const suToken = await getSuToken()

		await request(`/admin-panel/workers/${ mode }-file-different-name.node.js`, {
			suToken,
			source: sourcePath,
			destination: destinationPath
		})
			.catch(err => {
				// This should never happen

				notification(
					'Unspecified Error',
					`status code: ${ err.status }, body: <code>${ err.response }</code>`
				)

				throw err
			})

		const pastSimpleVerb = (mode == 'copy') ? 'copied' : 'moved'

		notification(
			`${ captitalise(pastSimpleVerb) } File`,
			`Succesfully ${ pastSimpleVerb } file <code>${ sourcePath }</code> to <code>${ destinationPath }</code>`
		)

		// Refresh files

		showFiles(new URLSearchParams(document.location.search).get('path'))
	} catch(err) {
		// User cancelled
	}
}

/*

	4.7 Rename File

*/

const renameFile = async (sourcePath: string) => {
	try {
		const popupRes = await popup(
			`Renaming File`,
			`Enter a new name for <code>${ sourcePath.substring(sourcePath.lastIndexOf('/') + 1) }</code>`,
			[
				{
					name: 'Rename'
				}
			],
			[
				{
					name: 'new-name',
					placeholder: 'Enter a new name...',
					type: 'text',
					value: sourcePath.substring(sourcePath.lastIndexOf('/') + 1),
					enterTriggersButton: 'Rename'
				}
			]
		)
	
		if (popupRes.buttonName == 'Rename') {
			const newName = popupRes.inputs.get('new-name')
			const dirPath = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1)
			const destinationPath = dirPath + newName

			const suToken = await getSuToken()

			await request('/admin-panel/workers/move-file-different-name.node.js', {
				suToken,
				source: sourcePath,
				destination: destinationPath
			})
				.catch(err => {
					// This should never happen

					notification(
						'Unspecified Error',
						`status code: ${ err.status }, body: <code>${ err.response }</code>`
					)

					throw err
				})

			notification(
				`Renamed file`,
				`Succesfully renamed file <code>${ sourcePath }</code> to <code>${ destinationPath }</code>`
			)

			// Refresh files

			showFiles(new URLSearchParams(document.location.search).get('path'))
		}
	} catch(err) {
		// User cancelled
	}
}

/*

	4.8 Create New Directory

*/

const createNewDirectory = async (parentDirectoryPath: string) => {
	try {
		const popupRes = await popup(
			'New Folder',
			`Creating a new folder in <code>${ parentDirectoryPath }</code>`,
			[
				{
					name: 'Create'
				}
			],
			[
				{
					name: 'new-dir-name',
					placeholder: 'Enter a name...',
					type: 'text',
					enterTriggersButton: 'Create'
				}
			]
		)
		
		const newDirName = popupRes.inputs.get('new-dir-name')
		const newDirectoryPath = parentDirectoryPath + newDirName

		const suToken = await getSuToken()

		await request('/admin-panel/workers/create-new-directory.node.js', {
			suToken,
			newDirectoryPath
		})
			.catch(err => {
				// This should never happen

				notification(
					'Unspecified Error',
					`status code: ${ err.status }, body: <code>${ err.response }</code>`
				)

				throw err
			})

		notification(
			`Created directory`,
			`Succesfully created directory <code>${ newDirName }</code>`
		)

		// Refresh files

		showFiles(new URLSearchParams(document.location.search).get('path'))
} catch(err) {
		// User cancelled
	}
}