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
			3.5.2 Edit Video Path
		3.6 Collect Page Template Inputs
		3.7 img[] Functions
			3.7.1 Move Image
			3.7.2 Edit Image
			3.7.3 Delete Image
			3.7.4 Add Image
		3.8 Element Group Functions
			3.8.1 Move Group
			3.8.2 Delete Group
			3.8.3 Add Group

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

	5. Database manager
		5.1 Get Database List
		5.2 Show Database List
		5.3 Get Table List of Database
		5.4 Show Table List of Database
		5.5 Get Table
		5.6 Show Table
			5.6.1 Create Input Element From Datatype
			5.6.2 Parse Input/Output Value
			5.6.3 Edit Row
			5.6.4 Update Row
			5.6.5 Delete Row
			5.6.6 Add Row
			5.6.7 Table Ordering
			5.6.8 Table Filtering
			5.6.9 Update Row Bounds
			5.6.10 Download Table to CSV
			5.6.11 Import to Table from CSV

	6. User Management
		6.1 Fetch Users
		6.2 Show User Management Panel
		6.3 Change User's Password
		6.4 Delete user
		6.5 Add User
*/

/* ===================
	1. On-load setup
=================== */

window.onload = async () => {
	const username = Cookies.get('username')

	goToTheRightPage()

	if (username == undefined) {
		// Login

		await login()
	}

	// Set the greeting

	const greetingLI = $<HTMLLIElement>('#greeting')
	greetingLI.innerText = `Welcome, ${ Cookies.get('username') }!`
}

/* ===================
	2. Common Types and Functions
=================== */

declare namespace tinymce {
	export function init(obj: Object): void
}

declare namespace tinyMCE {
	interface Editor {
		editorContainer: HTMLElement
		getContent: () => string
		remove: () => void
	}

	export function get(any: any): any
	export const editors: Editor[]
}

const saveTinyMCEState = () => {
	for (const editor of tinyMCE.editors) {
		const textArea = editor.editorContainer.previousElementSibling as HTMLTextAreaElement
		textArea.innerText = editor.getContent()
	}
}

const reloadTinyMCE = () => {
	for (const editor of tinyMCE.editors) {
		editor.remove()
	}

	initTinyMCE()
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

let pagesDB: Pages_DB

interface Pages_DB {
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

interface GroupItem {
	name: string
	type: ContentType | GroupItem[]
}

type ContentType = 'string' | 'text' | 'img[]' | 'img_caption[]' | 'img' | 'video' | 'date' | GroupItem[]

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

const fetchPages = () => new Promise<void>(async resolve => {
	const suToken = await getSuToken()

	request('/admin-panel/workers/get-pages.node.js', {
		suToken
	})
		.then(res => {
			pagesDB = JSON.parse(res)
			resolve()
		})
		.catch(handleRequestError)
})

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

	if (pageHistory.size > 0) {
		if (pageHistory.top.data != window.location.href) {
			pageHistory.push(window.location.href)
		}
	} else {
		pageHistory.push(window.location.href)
	}
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
	} else if (tab == 'pages') {
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
	} else if (tab == 'database-overview') {
		showDatabaseList()
	} else if (tab == 'show-database') {
		const dbName = searchParams.get('db-name')

		showTableListOfDatabase(dbName)
	} else if (tab == 'show-database-table') {
		const dbName = searchParams.get('db-name')
		const tableName = searchParams.get('table-name')
		const isView = searchParams.get('is-view') == 'true'

		showTable(dbName, tableName, isView)
	} else if (tab == 'user-management') {
		showUserManagement()
	}
}

// Handle back- and forward button

addEventListener('popstate', goBackInHistory)

const goToHomepage = () => {
	// Todo: make homepage

	setSearchParams({})

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

const reduceSet = <V>(
	set: Set<V>,
	f: (value: V) => string
) => {
	let output = ''

	for (let value of set) {
		output += f(value)
	}

	return output
}

const reduceMap = <K, V>(
	map: Map<K, V>,
	f: (key: K, value: V) => string
) => {
	let output = ''

	for (let [ key, value ] of map) {
		output += f(key, value)
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
			const { pages, pageTypes } = pagesDB

			$('.main').innerHTML = /* html */ `
			<h1>Pages</h1>

			<div class="table-container">
				<table class="fullwidth">
					<thead>
						<tr>
							<td class="col-name">Page Name</td>
							<td class="col-options"></td>
							<td></td>
							<td></td>
						</tr>
					</thead>
					<tbody>
					${
					reduceArray(pageTypes, pageType => {
						const pagesOfCurrentType = pages.filter(
							page => page.pageType == pageType.name
						)

						return /* html */ `
						${
						pageType.canAdd ? /* html */ `
						<tr class="thick-border">
							<td>${ captitalise(pageType.name) }</td>
							<td class="col-options">
								<button class="small" onclick="addPage('${ pageType.name }')">Add page</button>
							</td>
							<td></td>
							<td></td>
						</tr>
						` : ''
						}
						${
						reduceArray(pagesOfCurrentType, (page, i) => /* html */ `
						<tr class="page-row ${ !pageType.canAdd ? 'thick-border' : '' }">
							<td>
								${ pageType.canAdd ? `${ '&nbsp;'.repeat(pageType.name.length) } > ${ page.pageContent.title }` : captitalise(pageType.name) }
							</td>
							<td class="col-options">
								<button class="small" onclick="editPage(${ page.id })">Edit</button>
								${ pageType.canAdd ? /* html */ `
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
						}
						`
					})
					}
					</tbody>
				</table>
			</div>
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
		.catch(handleRequestError)
}

/*

	3.2 Edit Page

*/

const editPage = async (id: number) => {
	showLoader()

	await fetchPages()

	const page = pagesDB.pages.find(el => el.id == id)
	const { template, canAdd } = pagesDB.pageTypes.find(el => el.name == page.pageType)

	const pageTitle = canAdd ? page.pageContent.title : page.pageType

	$('.main').innerHTML = /* html */ `
	<h1>Editing page "${ pageTitle }"</h1>

	${ reduceObject(template, input => /* html */ `
	<br/><br/>
	<h2>${ input }:</h2>
	${ pageTemplateInputToHTML(template[input], input, page.pageContent[input]) }
	`) }

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
				notification('Saved page', `Successfully saved page "${ pageTitle }"!`)

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
}

/*

	3.3 Add Page

*/

const addPage = async (pageType: string) => {
	showLoader()

	await fetchPages()

	const { template } = pagesDB.pageTypes.find(el => el.name == pageType)

	$('.main').innerHTML = /* html */ `
	<h1>Creating new page of type "${ pageType }"</h1>

	${ reduceObject(template, (input: string) => /* html */ `
	<br/><br/>
	<h2>${ input }:</h2>
	${ pageTemplateInputToHTML(template[input], input, '') }
	`) }

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
}

/*

	3.4 Delete Page

*/

const deletePage = async (id: number) => {
	showLoader()

	await fetchPages()

	const page = pagesDB.pages.find(el => el.id == id)
	const { canAdd } = pagesDB.pageTypes.find(el => el.name == page.pageType)

	const pageTitle = canAdd ? page.pageContent.title : page.pageType

	await popup(
		`Deleting page "${ pageTitle }"`,
		'Are you sure you want to delete this page?',
		[
			{
				name: 'Delete Page',
				classes: [ 'red' ]
			}
		]
	)

	const suToken = await getSuToken()

	request('/admin-panel/workers/delete-page.node.js', {
		suToken,
		pageId: page.id
	})
		.then(() => {
			notification('Deleted page', `Successfully deleted page "${ pageTitle }"!`)

			showPages()
		})
		.catch(handleRequestError)

	setSearchParams({
		tab: 'delete-page',
		'page-id': id
	})
}

/*

	3.5 Page Template Input To HTML

*/

const globalInputTypes: GroupItem[][] = []

const pageTemplateInputToHTML = (
	inputType: ContentType,
	inputName: string,
	inputContent: any,
	nested = false
) => {
	switch (inputType) {
		default: {
			if (!Array.isArray(inputType)) {
				return /* html */ `
				<p>Error: unknown type "${ (inputType as any).toString() }"</p>
				`
			}

			const inputTypeIndex = globalInputTypes.length
			globalInputTypes.push(inputType)

			return /* html */ `
			<div class="element-group" root="${ !nested }" data-input="${ inputName }">
				${ reduceArray(inputContent as any, (el, i) => /* html */ `
				<div class="element-group-item">
					<div class="content">
						${ reduceArray(inputType, group => /* html */ `
						<h3>${ group.name }:</h3>
						${ pageTemplateInputToHTML(group.type, group.name, el[group.name], true) }
						`) }
					</div>
					<br>
					<button class="small red" onclick="deleteGroup(this)">Delete</button>

					${ i != 0 ? /* html */ `
					<button class="small move-group-button up" onclick="moveGroup(this, 'up')">Move up</button>
					` : '' }

					${ i != inputContent.length - 1 ? /* html */ `
					<button class="small move-group-button down" onclick="moveGroup(this, 'down')">Move down</button>
					` : '' }
				</div>
				`) }
				<button class="small" onclick="addGroup(this, ${ inputTypeIndex })">Add</button>
			</div>
			`
		}

		case 'text': {
			const value = inputContent
				? (inputContent as string).replace(/"/g, '&quot;')
				: ''

			return /* html */ `
			<div class="tinymce-container" root="${ !nested }" data-input="${ inputName }">
				<textarea>
					${ value }
				</textarea>
			</div>
			`
		}

		case 'string': {
			const value = inputContent
				? (inputContent as string).replace(/"/g, '&quot;')
				: ''

			return /* html */ `
			<input root="${ !nested }" data-input="${ inputName }" type="text" value="${ value }" />
			`
		}

		case 'img[]': {
			const imgs = inputContent ? inputContent as string[] : []

			return /* html */ `
			<div class="img-array" root="${ !nested }" data-input="${ inputName }">
				${ reduceArray(imgs, (img, i) =>
					generateImgArrayImg(img, (i != 0), (i != imgs.length - 1))
				)}
				<div class="img-array-plus" onclick="addImg('${ inputName }')"></div>
			</div>
			`
		}

		case 'img_caption[]': {
			const imgsAndCaptions = inputContent ? inputContent as [ string, string ][] : []

			return /* html */ `
			<div class="img-array" root="${ !nested }" data-input="${ inputName }">
				${ reduceArray(imgsAndCaptions, (imgAndCaption, i) =>
					generateImgAndCaptionArrayInstance(imgAndCaption, (i != 0), (i != imgsAndCaptions.length - 1))
				)}
				<div class="img-array-plus" onclick="addImg('${ inputName }', true)"></div>
			</div>
			`
		}

		case 'img': {
			const img = inputContent ? inputContent as string : ''

			return /* html */ `
			<div class="img-array" root="${ !nested }" data-input="${ inputName }">
				${ generateImgArrayImg(img, false, false) }
			</div>
			`
		}

		case 'video': {
			const videoPath = inputContent ? inputContent as string : ''

			return /* html */ `
			<video src="${ videoPath }" root="${ !nested }" data-input="${ inputName }" data-path="${ videoPath.replace(/\"/g, '&quot;') }" height="200" autoplay muted controls></video>
			<button class="small" onclick="editVideoPath(this)">Edit</button>
			`
		}

		case 'date': {
			const date = new Date(inputContent)
			const yyyy = date.getFullYear().toString().padStart(4, '0')
			const mm = (date.getMonth() + 1).toString().padStart(2, '0')
			const dd = date.getDate().toString().padStart(2, '0')

			const dateString = `${ yyyy }-${ mm }-${ dd }`

			return /* html */ `
			<input root="${ !nested }" data-input="${ inputName }" type="date" value="${ dateString }">
			`
		}
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

const generateImgAndCaptionArrayInstance = (
	imgAndCaption: [ string, string ],
	hasLeftArrow: boolean,
	hasRightArrow: boolean
) => /* html */ `
<div class="img-array-img img-caption-array-img">
	<div class="img-array-img-options">
		<button class="small light" onclick="editImg(this)">Edit</button>
		<button class="small light red" onclick="deleteImg(this)">Delete</button>
	</div>
	<div class="img-array-img-arrows">
		${ (hasLeftArrow) ? /* html */ `
		<img class="arrow-left" src="/admin-panel/img/arrow-left.png" alt="arrow-left" onclick="moveImgWithCaption('left', this)">
		` : '' }
		${ (hasRightArrow) ? /* html */ `
		<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImgWithCaption('right', this)">
		` : '' }
	</div>
	<img class="img" data-path="${ imgAndCaption[0] }" src="${ imgAndCaption[0] }">
	<br>
	<input class="caption" type="text" value="${ imgAndCaption[1] }" placeholder="caption" />
</div>
`

// 3.5.2 Edit Video Path

const editVideoPath = async (
	buttonEl: HTMLButtonElement
) => {
	// Select a new video

	const newVideoPath = await filePicker({
		type: 'file',
		title: 'Edit video',
		body: 'Select a new video',
		buttonText: 'Select',
		extensions: videoExtensions
	}, false)
		.catch(() => {
			throw new Error(`User cancelled`)
		})

	// Update the old video

	const videoEl = buttonEl.parentElement.querySelector<HTMLVideoElement>('video')

	videoEl.setAttribute('data-path', `/content${ newVideoPath }`)
	videoEl.src = `/content${ newVideoPath }`
}

/*

	3.6 Collect Page Template Inputs

*/

const isChildOf = (child: HTMLElement, parent: HTMLElement) => {
	let node = child

	while (node.parentElement != null) {
		node = node.parentElement
		if (node == parent) return true
	}

	return false
}

const collectInput = (input: HTMLElement, inputType: ContentType) => {
	switch (inputType) {
		default: {
			const itemEls = input.querySelectorAll<HTMLDivElement>('.element-group-item')
			const out = []

			for (let i = 0; i < itemEls.length; i++) {
				const itemEl = itemEls[i].querySelector<HTMLDivElement>('.content')
				const item = {}

				for (const groupItem of inputType) {
					const childInput = ([].slice.call(itemEl.children) as HTMLElement[]).filter(
						potChildInput => potChildInput.getAttribute('data-input') == groupItem.name)[0]

					item[groupItem.name] = collectInput(childInput, groupItem.type)
				}

				out.push(item)
			}

			return out
		}

		case 'text': {
			return tinyMCE.editors.filter(
				editor => isChildOf(editor.editorContainer, input))[0].getContent()
		}

		case 'string': {
			return (input as HTMLInputElement).value.trim()
		}

		case 'img[]': {
			const out = []
			const imgs = input.querySelectorAll<HTMLImageElement>('.img')

			for (let i = 0; i < imgs.length; i++) {
				out[i] = imgs[i].getAttribute('data-path')
			}

			return out
		}

		case 'img_caption[]': {
			const out = []
			const imgs = input.querySelectorAll<HTMLImageElement>('.img')
			const captions = input.querySelectorAll<HTMLInputElement>('.caption')

			for (let j = 0; j < imgs.length; j++) {
				out[j] = [ imgs[j].getAttribute('data-path'), captions[j].value ]
			}

			return out
		}

		case 'img': {
			return input.querySelector<HTMLImageElement>('.img').getAttribute('data-path')
		}

		case 'video': {
			return input.getAttribute('data-path')
		}

		case 'date': {
			return new Date((input as HTMLInputElement).value).getTime()
		}
	}
}

const collectInputs = (template: PageTemplate) => {
	// Get all input elements

	const elements = document.querySelectorAll<HTMLInputElement>('[root="true"][data-input]')
	const pageContent: PageContent = {}

	// Parse inputs

	for (let i = 0; i < elements.length; i++) {
		const inputKey = elements[i].getAttribute('data-input')
		const inputType = template[inputKey]
		pageContent[inputKey] = collectInput(elements[i], inputType)
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

const moveImgWithCaption = async (
	direction: 'left' | 'right',
	arrowEl: HTMLImageElement
) => {
	const imgArrayImgEl = arrowEl.parentElement.parentElement

	// Swap images visually

	// Get the first image element and save its path

	const imgEl1 = imgArrayImgEl.querySelector<HTMLImageElement>('.img')
	const imgSource1 = imgEl1.getAttribute('data-path')

	// Get the first caption

	const captionEl1 = imgArrayImgEl.querySelector<HTMLInputElement>('.caption')
	const captionValue1 = captionEl1.value

	// Get the other image element and save its path

	const imgEl2 = (direction == 'left')
		? imgArrayImgEl.previousElementSibling.querySelector<HTMLImageElement>('.img')
		: imgArrayImgEl.nextElementSibling.querySelector<HTMLImageElement>('.img')
	const imgSource2 = imgEl2.getAttribute('data-path')

	// Get the other caption

	const captionEl2 = (direction == 'left')
		? imgArrayImgEl.previousElementSibling.querySelector<HTMLInputElement>('.caption')
		: imgArrayImgEl.nextElementSibling.querySelector<HTMLInputElement>('.caption')
	const captionValue2 = captionEl2.value

	// Swap the images

	imgEl1.src = imgSource2
	imgEl1.setAttribute('data-path', imgSource2)
	imgEl2.src = imgSource1
	imgEl2.setAttribute('data-path', imgSource1)

	// Swap the captions

	captionEl1.value = captionValue2
	captionEl2.value = captionValue1
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
	inputName: string,
	withCaption = false
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

	if (!withCaption) {
		imgArrayPlus.insertAdjacentHTML(
			'beforebegin',
			generateImgArrayImg(`/content${ newImgPath }`, (imgArrayPlus.previousElementSibling != null), false)
		)
	} else {
		imgArrayPlus.insertAdjacentHTML(
			'beforebegin',
			generateImgAndCaptionArrayInstance([ `/content${ newImgPath }`, '' ], (imgArrayPlus.previousElementSibling != null), false)
		)
	}

	// Add a right arrow to the previous image if it exists

	const prevImgArrayImg = imgArrayPlus.previousElementSibling.previousElementSibling

	if (prevImgArrayImg != null && !withCaption) {
		prevImgArrayImg.querySelector('.img-array-img-arrows').innerHTML += /* html */ `
		<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImg('right', this)">
		`
	}

	if (prevImgArrayImg != null && withCaption) {
		prevImgArrayImg.querySelector('.img-array-img-arrows').innerHTML += /* html */ `
		<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImgWithCaption('right', this)">
		`
	}
}

/*

	3.8 Element Group Functions

*/

// 3.8.1 Move Group

const moveGroup = (
	buttonEl: HTMLButtonElement,
	direction: 'up' | 'down'
) => {
	// For some reason we need to do this twice to get it to work

	saveTinyMCEState()
	saveTinyMCEState()

	const thisItem = buttonEl.parentElement.querySelector<HTMLDivElement>('.content')
	const thisItemContainer = buttonEl.parentElement

	if (direction == 'up') {
		const previousItem = buttonEl.parentElement.previousElementSibling.querySelector<HTMLDivElement>('.content')
		const previousItemContainer = buttonEl.parentElement.previousElementSibling

		thisItemContainer.insertAdjacentElement('afterbegin', previousItem)
		previousItemContainer.insertAdjacentElement('afterbegin', thisItem)
	} else {
		const nextItem = buttonEl.parentElement.nextElementSibling.querySelector<HTMLDivElement>('.content')
		const nextItemContainer = buttonEl.parentElement.nextElementSibling

		thisItemContainer.insertAdjacentElement('afterbegin', nextItem)
		nextItemContainer.insertAdjacentElement('afterbegin', thisItem)
	}

	// For some reason we need to reload it twice to get it to work

	reloadTinyMCE()
	reloadTinyMCE()
}

// 3.8.2 Delete Group

const deleteGroup = (
	buttonEl: HTMLButtonElement
) => {
	const previousItem = buttonEl.parentElement.previousElementSibling
	const nextItem = buttonEl.parentElement.nextElementSibling

	if (previousItem == null) {
		if (nextItem != null) {
			nextItem.querySelector('.move-group-button.up').remove()
		}
	}

	if (nextItem == null) {
		if (previousItem != null) {
			previousItem.querySelector('.move-group-button.down').remove()
		}
	}

	buttonEl.parentElement.remove()
}

// 3.8.3 Add Group

const addGroup = (
	buttonEl: HTMLButtonElement,
	inputTypeIndex: number
) => {
	const inputType = globalInputTypes[inputTypeIndex]

	if (buttonEl.previousElementSibling != null) {
		buttonEl.previousElementSibling.insertAdjacentHTML('beforeend', /* html */ `
		<button class="small move-group-button down" onclick="moveGroup(this, 'down')">Move down</button>
		`)
	}

	buttonEl.insertAdjacentHTML('beforebegin', /* html */ `
	<div class="element-group-item">
		<div class="content">
			${ reduceArray(inputType, group => /* html */ `
			<h3>${ group.name }:</h3>
			${ pageTemplateInputToHTML(group.type, group.name, null, true) }
			`) }
		</div>
		<br>
		<button class="small red" onclick="deleteGroup(this)">Delete</button>
		<button class="small move-group-button up" onclick="moveGroup(this, 'up')">Move up</button>
	</div>
	`)

	initTinyMCE()
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
) => new Promise<void>(resolve => {
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

			// Create progressbar

			const progressBar = new ProgressBar()

			// Send the request

			request('/admin-panel/workers/fileupload.node.js', body, files, {
				onRequestUploadProgress: e => progressBar.set(e.loaded / e.total)
			})
				.then(() => {
					progressBar.remove()
					resolve()
				})
				.catch(handleRequestError)
		})
})

/*

	4.2 Drop Area

*/

const initDropArea = (path = '/') => new Promise(resolve => {
	const dropArea = $<HTMLDivElement>('.drop-area')

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

interface FileInfo {
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

	${ (options.body != undefined) ? /* html */ `
	<p class="popup-body">${ options.body }</p>
	` : '' }

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

	${ (options.type == 'new-file') ? /* html */ `
	<p>Fill in the name of the file</p>
	<input type="text" class="filepicker-new-file" value="${ options.newFileName }" placeholder="Enter new file name...">
	` : '' }

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
						: getExtension(name)

					// Create the child LI

					fileListEl.innerHTML += /* html */ `
					<li class="file-list-item" onclick="selectLI(this)" onmouseover="hoverLI(this)" onmouseleave="hoverLI(this, false)" data-path="${
						(file.isDirectory) ? path + file.name + '/' : path + file.name
					}">
						${
						(file.isDirectory) ? /* html */ `<span class="plus-button" data-expanded="false" onclick="expandDirectory(this)"></span>`: ''
						}
						<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/${ extension }.png" alt="${ extension }" onerror="
							this.src = '/admin-panel/img/file-icons/unknown.png';
							this.onerror = null;
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

const getFiles = (
	path = '/'
) => new Promise<FileInfo[]>(async (resolve, reject) => {
	const suToken = await getSuToken()

	request('/admin-panel/workers/get-files.node.js', {
		path, suToken
	})
		.then(res => {
			const fileArray = JSON.parse(res).files as FileInfo[]
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
	const checkboxes = $a<HTMLInputElement>('tbody .col-checkbox input[type="checkbox"]')

	for (let checkbox of checkboxes) {
		if (!checkbox.checked) {
			return false
		}
	}

	return true
}

const checkAllCheckboxes = (check = true) => {
	const checkboxes = $a<HTMLInputElement>('tbody .col-checkbox input[type="checkbox"]')

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
				<button class="small" onclick="openFileInput()">Upload Files</button>
				<button class="small" onclick="createNewDirectory('${ path }')">New Folder</button>
				<div class="bulk-actions hidden">
					Selected Files:
					<button class="small" onclick="bulkCopyFiles()">Copy</button>
					<button class="small" onclick="bulkMoveFiles()">Move</button>
					<button class="small red" onclick="bulkDeleteFiles()">Delete</button>
				</div>

				<br><br>

				<div class="table-container">
					<table class="fullwidth">

						<thead>
							<tr>
								<td class="col-checkbox">
									<input type="checkbox" onclick="toggleAllCheckboxes()" title="Select all">
								</td>
								<td class="col-icon"></td>
								<td class="col-name">Name</td>
								<td class="col-size">Size</td>
								<td class="col-modified">Last Modified</td>
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
										$('.bulk-actions').classList.remove('hidden')
									}

									const hideBulkFileActions = () => {
										bulkFileActionsShown = false
										$('.bulk-actions').classList.add('hidden')
									}

									;(window as any).handleFileCheckboxes = (checkboxEl: HTMLInputElement) => {
										const selectAllCheckbox = $<HTMLInputElement>('thead .col-checkbox input[type="checkbox"]')

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
										const selectedFiles: FileInfo[] = []

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
																	`Successfully copied ${ numifyNoun(selectedFiles.length, 'file', 'files') } to <code>${ selectedFolder }</code>`
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
																	`Successfully moved ${ numifyNoun(selectedFiles.length, 'file', 'files') } to <code>${ selectedFolder }</code>`
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
											<button class="small" onclick="copyFile('${ path + file.name }')">Copy</button>
											<button class="small" onclick="moveFile('${ path + file.name }')">Move</button>
											<button class="small" onclick="renameFile('${ path + file.name }')">Rename</button>
											<button class="small red" onclick="deleteFile('${ path + file.name }')">Delete</button>
										</td>
									</tr>
									`
								})
							}
						</tbody>

					</table>
				</div>
			</div>
			`

			;(window as any).openFileInput = () => {
				$('input[type=file]').click()
			}

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
			`Successfully ${ pastSimpleVerb } file <code>${ sourcePath }</code> to <code>${ destinationPath }</code>`
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
			`Successfully renamed file <code>${ sourcePath }</code> to <code>${ destinationPath }</code>`
		)

		// Refresh files

		showFiles(new URLSearchParams(document.location.search).get('path'))
	}
}

/*

	4.8 Create New Directory

*/

const createNewDirectory = async (parentDirectoryPath: string) => {
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
		`Successfully created directory <code>${ newDirName }</code>`
	)

	// Refresh files

	showFiles(new URLSearchParams(document.location.search).get('path'))
}

/* ===================
	5. Database manager
=================== */

interface DB_Info {
	name: string
	size: number
	modified: string
}

interface DB {
	tables: {
		[tableName: string]: DB_Table
	},
	data?: {
		[key: string]: any
	}
}

interface DB_Table {
	cols: DB_Table_Col[]
	rows: DB_Table_Row[]
}

interface DB_Table_Col {
	name: string
	dataType: DataType
	constraints?: Constraint[]
	foreignKey?: Link
	linkedWith?: Link[]
	default?: any
	data?: {
		[key: string]: any
	}
}

interface TableRepresentation {
	cols: DB_Table_Col[]
	rows: DB_Table_Row_Formatted[]
	data?: any
	totalRows: number
}

interface Link {
	table: string
	column: string
}

type DB_Table_Row = any[]

interface DB_Table_Row_Formatted {
	[colName: string]: any
}

type DataType = 'Binary' | 'Hex' | 'Bit' | 'Int' | 'Float' | 'DateTime' | 'String' | 'Char' | 'JSON' | 'Boolean'
type Constraint = 'primaryKey' | 'autoIncrement' | 'notNull' | 'unique'

/*
	5.1 Get Database List
*/

const getDatabaseList = async () => {
	try {
		const suToken = await getSuToken()

		const response = await request('/admin-panel/workers/database/list.node.js', {
			suToken
		})
		const databases = JSON.parse(response) as DB_Info[]

		return databases

	} catch(err) {
		handleRequestError(err)
	}
}

/*
	5.2 Show Database List
*/

const showDatabaseList = async () => {
	showLoader()

	setSearchParams({
		tab: 'database-overview'
	})

	const databases = await getDatabaseList()

	$('.main').innerHTML = /* html */ `
	<h1>Databases</h1>

	<div class="table-container">
		<table class="fullwidth databases-list">
			<thead>
				<td class="col-icon"></td>
				<td>Name</td>
				<td>Size</td>
				<td>Last Modified</td>
				<td class="col-options"></td>
			</thead>
			<tbody>
				${ reduceArray(databases, dbInfo => /* html */ `
				<tr>
					<td class="col-icon">
						<img class="file-manager-file-icon" src="/admin-panel/img/database.png" alt="Database Icon">
					</td>
					<td class="col-name" onclick="showTableListOfDatabase('${ dbInfo.name }')">${ dbInfo.name.replace('.json', '') }</td>
					<td>${ parseSize(dbInfo.size) }</td>
					<td>${ parseDate(dbInfo.modified) }</td>
					<td class="col-options">
						<button class="small" onclick="showTableListOfDatabase('${ dbInfo.name }')">View</button>
					</td>
				</tr>
				`) }
			</tbody>
		</table>
	</div>

	`
}

/*
	5.3 Get Table List of Database
*/

interface DB_Tables_List {
	tables: {
		[tableName: string]: {
			rowCount: number
			colCount: number
		}
	},
	views: string[]
}

const getTableListOfDatabase = async (
	dbName: string
) => {
	const suToken = await getSuToken()

	try {
		const response = await request('/admin-panel/workers/database/list-tables.node.js', {
			suToken, dbName
		})

		return JSON.parse(response) as DB_Tables_List
	} catch(err) {
		handleRequestError(err)
	}

}

/*
	5.4 Show Table List of Database
*/

const showTableListOfDatabase = async (
	dbName: string
) => {
	showLoader()

	setSearchParams({
		tab: 'show-database',
		'db-name': dbName
	})

	const tablesAndViews = await getTableListOfDatabase(dbName)

	const createTableRow = (
		name: string,
		rowCount: number,
		colCount: number,
		isView = false
	) => {
		const displayName = isView ? `${ name } <em class="green-colour">(view)</em>` : name

		return /* html */ `
		<tr>
			<td class="col-icon">
				<img class="file-manager-file-icon" src="/admin-panel/img/table.png" alt="Table Icon">
			</td>
			<td class="col-name" onclick="showTable('${ dbName }', '${ name }', ${ isView })">${ displayName }</td>
			<td>${ isView ? '' : rowCount }</td>
			<td>${ isView ? '' : colCount }</td>
			<td class="col-options">
				<button class="small" onclick="showTable('${ dbName }', '${ name }', ${ isView })">View</button>
			</td>
		</tr>
		`
	}

	$('.main').innerHTML = /* html */ `
	<h1>
		<img class="inline-centered-icon" src="/admin-panel/img/database.png" alt="Database Icon">
		${ dbName.replace('.json', '') }
	</h1>

	<div class="table-container">
		<table class="fullwidth database-tables-list">
			<thead>
				<td></td>
				<td>Table Name</td>
				<td>Rows</td>
				<td>Columns</td>
				<td class="col-options"></td>
			</thead>
			<tbody>
				${ reduceObject(tablesAndViews.tables, tableName => {
					const { rowCount, colCount } = tablesAndViews.tables[tableName]

					return createTableRow(tableName, rowCount, colCount)
				}) }
				${ reduceArray(tablesAndViews.views, viewName => {
					return createTableRow(viewName, null, null, true)
				}) }
			</tbody>
		</table>
	</div>

	`
}

/*
	5.5 Get Table
*/

const getTable = async (
	dbName: string,
	tableName: string,
	orderArr: (string | [ string, 'ASC' | 'DESC' ])[] = []
) => {
	const suToken = await getSuToken()

	try {
		const { from, to } = currentBounds
		const filterArr = currentCustomFilters
		const builtInFilterArr = Array.from(currentActiveBuiltInFilters)
		const isView = currentTableIsView

		const response = await request('/admin-panel/workers/database/table/get.node.js', {
			suToken, dbName, tableName, isView, orderArr, filterArr, builtInFilterArr, from, to
		})

		return JSON.parse(response) as TableRepresentation
	} catch(err) {
		handleRequestError(err)
	}
}

/*
	5.6 Show Table
*/

let currentTable: TableRepresentation
let currentDbName: string
let currentTableName: string
let currentTableIsView: boolean

let currentOrderBy = new Map<string, 'ASC' | 'DESC'>()
let currentBuiltInFilters = new Set<string>()
let currentActiveBuiltInFilters = new Set<string>()
let currentCustomFilters: CustomFilter[] = []

let currentBounds = {
	from: 0,
	to: 19
}

const showTable = async (
	dbName: string,
	tableName: string,
	isView = false
) => {
	showLoader()

	setSearchParams({
		tab: 'show-database-table',
		'db-name': dbName,
		'table-name': tableName,
		'is-view': isView.toString()
	})

	currentTableIsView = isView
	currentTable = await getTable(dbName, tableName, [])
	currentDbName = dbName
	currentTableName = tableName

	currentOrderBy.clear()
	currentActiveBuiltInFilters.clear()
	currentBuiltInFilters.clear()
	currentCustomFilters = []

	const { data } = currentTable

	// Get the built-in filters from the extra data of the table

	if (data != undefined) {
		if (data.filters != undefined) {
			for (let filterName in data.filters) {
				currentBuiltInFilters.add(filterName)
			}
		}
	}

	$('.main').innerHTML = /* html */ `
	<h1>
		<img class="inline-centered-icon" src="/admin-panel/img/table.png" alt="Table Icon">
		<a class="underline" onclick="showTableListOfDatabase('${ currentDbName }')">${ currentDbName.replace('.json', '') }</a> > ${ currentTableName }
	</h1>

	<div class="table-action-row">
		<button onclick="setCustomFilters()" class="small">Filter</button>
		<button onclick="downloadTableToCSV()" class="small">Download to CSV</button>
		${ (currentTable.data?.importScript != null) ? /* html */ `
		<button onclick="importRowsFromCSV()" class="small">Import Rows from CSV</button>
		` : '' }
	</div>

	<br>

	<div class="table-container"></div>

	<div class="table-rows-selector">
		Showing rows
		<input type="number" id="lower-row-bound" class="small short" value="${ currentBounds.from + 1 }">
		-
		<input type="number" id="upper-row-bound" class="small short" value="${ currentBounds.to + 1 }">
		of <span id="total-rows">${ currentTable.totalRows }</span>.
		<button class="small" onclick="updateRowBounds()">Update</button>
	</div>

	<h3>Built-in filters:</h3>

	<div class="built-in-filters">
		${ reduceSet(currentBuiltInFilters, filterName => /* html */ `
		<input type="checkbox" onchange="setTableFilter('${ filterName }', this.checked)">
		${ filterName }
		<br>
		`) }
	</div>
	`

	updateTable()
}

const updateTable = () => {
	let table = currentTable

	const { rows, cols } = table

	$('.table-container').innerHTML = /* html */ `
	<table class="fullwidth database-table">
		<thead>
			<!-- The columns come here -->

			${ reduceArray(cols, col => {
				const dataType = `Datatype: ${ col.dataType }\n`

				const constraints = (col.constraints != undefined)
					? `Constraints: ${ col.constraints.join(', ') }\n`
					: ''

				const foreignKey = (col.foreignKey != undefined)
					? `Foreign Key: ${ col.foreignKey.table }.${ col.foreignKey.column }\n`
					: ''

				return /* html */ `
				<td data-col-name="${ col.name }" title="${ dataType }${ constraints }${ foreignKey }">
					${ col.name }
					<img onclick="toggleOrderTable(this, '${ col.name }')" class="order-direction hidden" src="/admin-panel/img/arrow-down-faded.png" data-direction="unset" title="Unset">
				</td>
				`
			}) }
			${ currentTableIsView ? '' : /* html */ `
			<td class="col-options"></td>
			` }
		</thead>
		<tbody>
			${ reduceArray(rows, row => /* html */ `
			<tr data-row-num="${ row.rowNum }">
				${ reduceArray(cols, col => /* html */ `
				<td data-datatype="${ col.dataType }" data-col-name="${ col.name }" class="col">${ parseOutputValue(row[col.name], col.dataType) }</td>
				`) }
				${ currentTableIsView ? '' : /* html */ `
				<td class="col-options">
					<button onclick="editRow('${ currentDbName }', '${ currentTableName }', ${ row.rowNum })" class="small edit">Edit</button>
					<button onclick="deleteRow('${ currentDbName }', '${ currentTableName }', ${ row.rowNum })" class="small red">Delete</button>
				</td>
				` }
			</tr>
			`) }
		</tbody>
		${ currentTableIsView ? '' : /* html */ `
		<tfoot>
			${ reduceArray(cols, col => /* html */ `
			<td data-datatype="${ col.dataType }" data-col-name="${ col.name }" class="col">
				${ createInputElFromDataType(col.dataType, null).outerHTML }
			</td>
			`) }
			<td>
				<button onclick="addRow('${ currentDbName }', '${ currentTableName }')" class="small">Add</button>
			</td>
		</tfoot>
		` }
	</table>
	`

	// Update total rows

	$('#total-rows').innerText = table.totalRows.toString()
}

// 5.6.1 Create Input Element From Datatype

const createInputElFromDataType = (
	dataType: DataType,
	data: any
) => {
	const inputEl = document.createElement('input')
	inputEl.classList.add('small')

	if (dataType == 'Binary') {
		inputEl.type = 'text'
		inputEl.value = data

		inputEl.addEventListener('input', () => {
			const { value } = inputEl

			// Make sure the value only contains 0's and 1's

			if (value.replace(/(0|1)/g, '') == '') {
				inputEl.classList.remove('red')
			} else {
				inputEl.classList.add('red')
			}
		})
	} else if (dataType == 'Bit') {
		inputEl.type = 'text'
		inputEl.value = data

		inputEl.addEventListener('input', () => {
			const { value } = inputEl

			// Make sure the value is either 0 or 1

			if (value == '0' || value == '1') {
				inputEl.classList.remove('red')
			} else {
				inputEl.classList.add('red')
			}
		})
	} else if (dataType == 'Boolean') {
		inputEl.type = 'checkbox'
		inputEl.classList.remove('small')
		inputEl.checked = data
	} else if (dataType == 'Char') {
		inputEl.type = 'text'
		inputEl.value = data

		inputEl.addEventListener('input', () => {
			const { value } = inputEl

			// Make sure the string length is 1

			if (value.length != 1) {
				inputEl.classList.remove('red')
			} else {
				inputEl.classList.add('red')
			}
		})
	} else if (dataType == 'DateTime') {
		inputEl.type = 'datetime-local'
		inputEl.value = (data == null || data == 0)
			? ''
			: parseDateTimeToInput(new Date(data))
	} else if (dataType == 'Float') {
		inputEl.type = 'number'
		inputEl.value = data
		inputEl.step = 'any'
	} else if (dataType == 'Hex') {
		inputEl.type = 'text'
		inputEl.value = data

		inputEl.addEventListener('input', () => {
			const { value } = inputEl

			// Make sure only the hexadecimal numbers are present

			if (value.toLowerCase().replace(/([0-9]|[a-f])/g, '') == '') {
				inputEl.classList.remove('red')
			} else {
				inputEl.classList.add('red')
			}
		})
	} else if (dataType == 'Int') {
		inputEl.type = 'number'
		inputEl.value = data
		inputEl.step = '1'
	} else if (dataType == 'JSON') {
		inputEl.type = 'text'
		inputEl.value = data
	} else if (dataType == 'String') {
		inputEl.type = 'text'
		inputEl.value = data
	} else {
		throw new Error(`Datatype '${ dataType }' not handled`)
	}

	return inputEl
}

// 5.6.2 Parse Input/Output Value

const parseInputValue = (
	input: HTMLInputElement,
	dataType: DataType
) => {
	const { value, checked } = input

	// Handle bad data

	if (input.classList.contains('red')) {
		throw new Error(`Input of '${ value }' could not be parsed to datatype '${ dataType }'`)
	}

	if (value == '') {
		return null
	}

	if (dataType == 'Binary') {
		return value
	} else if (dataType == 'Bit') {
		return parseInt(value)
	} else if (dataType == 'Boolean') {
		return checked
	} else if (dataType == 'Char') {
		return value
	} else if (dataType == 'DateTime') {
		return parseDateTimeToInput(new Date(value))
	} else if (dataType == 'Float') {
		return parseFloat(value)
	} else if (dataType == 'Hex') {
		return value
	} else if (dataType == 'Int') {
		return parseInt(value)
	} else if (dataType == 'JSON') {
		return value
	} else if (dataType == 'String') {
		return value
	} else {
		throw new Error(`Datatype '${ dataType }' not handled`)
	}
}

const parseOutputValue = (
	value: any,
	dataType: DataType
) => {
	if (value == null) {
		return ''
	}

	if (dataType == 'Binary') {
		return value
	} else if (dataType == 'Bit') {
		return value.toString()
	} else if (dataType == 'Boolean') {
		return value ? /* html */ `
		<img class="checkbox" src="/admin-panel/img/checkbox-checked.png" alt="true">
		` : /* html */ `
		<img class="checkbox" src="/admin-panel/img/checkbox-unchecked.png" alt="false">
		`
	} else if (dataType == 'Char') {
		return value
	} else if (dataType == 'DateTime') {
		return (value == null || value == 0)
			? ''
			: parseDateTimeToOutput(new Date(value))
	} else if (dataType == 'Float') {
		return value.toString()
	} else if (dataType == 'Hex') {
		return value
	} else if (dataType == 'Int') {
		return value.toString()
	} else if (dataType == 'JSON') {
		return value
	} else if (dataType == 'String') {
		return value
	} else {
		throw new Error(`Datatype '${ dataType }' not handled`)
	}
}

// 5.6.3 Edit Row

const editRow = (
	dbName: string,
	tableName: string,
	rowNum: number
) => {
	const rowEl = $<HTMLTableRowElement>(`tr[data-row-num="${ rowNum }"]`)
	const affectedIndex = currentTable.rows.findIndex(row => row.rowNum == rowNum)
	const affectedRow = currentTable.rows[affectedIndex]

	// Change button text to 'Save'

	const button = rowEl.querySelector<HTMLButtonElement>('button.edit')
	const savedOnclick = button.onclick
	button.onclick = null
	button.innerText = 'Save'

	// Change all fields to inputs

	const fields = rowEl.querySelectorAll<HTMLTableCellElement>('.col')

	fields.forEach(cell => {
		// Get data

		const colName = cell.getAttribute('data-col-name')
		const data = currentTable.rows.find(row => row.rowNum == rowNum)[colName]

		// Clear the text

		cell.innerHTML = ''

		// Get datatype

		const dataType = cell.getAttribute('data-datatype') as DataType

		// Add the input

		const input = createInputElFromDataType(dataType, data)
		cell.appendChild(input)
	})

	// Listen for the Save button click

	button.onclick = async () => {
		// Gather inputs

		fields.forEach(cell => {
			const colName = cell.getAttribute('data-col-name')
			const dataType = cell.getAttribute('data-datatype') as DataType
			const input = cell.querySelector('input')

			// Store the input value

			const value = parseInputValue(input, dataType)
			affectedRow[colName] = value
		})

		// Remove the inputs and add the plain data back in the cells

		fields.forEach(cell => {
			const colName = cell.getAttribute('data-col-name')
			const dataType = cell.getAttribute('data-datatype') as DataType
			const input = cell.querySelector('input')

			// Remove the input

			input.remove()

			// Add the plain data back in the cell

			cell.innerHTML = parseOutputValue(affectedRow[colName], dataType)
		})

		// Update the value in the database

		await updateRow(dbName, tableName, rowNum, affectedRow)

		// Update the value in our local database

		// Todo: Show loader
		// Reset button text to edit

		button.innerText = 'Edit'
		button.onclick = savedOnclick
	}
}

// 5.6.4 Update Row

const updateRow = async (
	dbName: string,
	tableName: string,
	rowNum: number,
	newRow: DB_Table_Row_Formatted
) => {
	const suToken = await getSuToken()

	try {
		await request('/admin-panel/workers/database/table/update-row.node.js', {
			suToken, dbName, tableName, rowNum, newRow
		})
	} catch(err) {
		handleRequestError(err)
	}
}

// 5.6.5 Delete Row

const deleteRow = async (
	dbName: string,
	tableName: string,
	rowNum: number
) => {
	const suToken = await getSuToken()

	try {
		// Todo: show loader

		await request('/admin-panel/workers/database/table/delete-row.node.js', {
			suToken, dbName, tableName, rowNum
		})

		// Refetch the table

		currentTable = await getTable(dbName, tableName, [])
		updateTable()
	} catch(err) {
		handleRequestError(err)
	}
}

// 5.6.6 Add Row

const addRow = async (
	dbName: string,
	tableName: string
) => {
	// Get the new row

	const newRow: DB_Table_Row_Formatted = {}

	const fields = $a<HTMLTableCellElement>('tfoot .col')

	for (let cell of fields) {
		const colName = cell.getAttribute('data-col-name')
		const dataType = cell.getAttribute('data-datatype') as DataType
		const input = cell.querySelector('input')

		// Store the input value

		const value = parseInputValue(input, dataType)
		newRow[colName] = value
	}

	// Query

	try {
		const suToken = await getSuToken()

		await request('/admin-panel/workers/database/table/insert-row.node.js', {
			suToken, dbName, tableName, newRow
		})

		// Refetch the table

		currentTable = await getTable(dbName, tableName, [])
		updateTable()
	} catch(err) {
		handleRequestError(err)
	}
}

// 5.6.7 Table Ordering

const toggleOrderTable = async (
	orderArrow: HTMLImageElement,
	colName: string
) => {
	/*

		Visuals

	*/

	const prevDirection = orderArrow.getAttribute('data-direction')
	let direction: 'unset' | 'up' | 'down'

	// Get new direction

	if (prevDirection == 'unset') {
		direction = 'down'
	} else if (prevDirection == 'down') {
		direction = 'up'
	} else {
		direction = 'unset'
	}

	// Set new direction

	orderArrow.setAttribute('data-direction', direction)
	orderArrow.title = captitalise(direction)

	// Set right image and style

	if (direction == 'up') {
		orderArrow.src = '/admin-panel/img/arrow-up.png'
	} else if (direction == 'down') {
		orderArrow.src = '/admin-panel/img/arrow-down.png'
	} else {
		orderArrow.src = '/admin-panel/img/arrow-down-faded.png'
	}

	if (direction == 'unset') {
		orderArrow.classList.add('hidden')
	} else {
		orderArrow.classList.remove('hidden')
	}

	/*

		Actual ordering

	*/

	if (direction == 'unset') {
		currentOrderBy.delete(colName)
	} else {
		currentOrderBy.set(colName, (direction == 'down') ? 'ASC' : 'DESC')
	}

	await orderCurrentTable()
	updateTable()
	setOrderArrowsOfTable()
}

const orderCurrentTable = async () => {
	// Generate orderBy array

	const orderArr: [ string, 'ASC' | 'DESC' ][] = []

	for (let [ colName, ordering ] of currentOrderBy) {
		orderArr.push([ colName, ordering ])
	}

	// Update table

	currentTable = await getTable(currentDbName, currentTableName, orderArr)
}

const setOrderArrowsOfTable = () => {
	for (let [ colName, ordering ] of currentOrderBy) {
		// Get element

		const orderArrow = $<HTMLImageElement>(`[data-col-name="${ colName }"] img.order-direction`)

		// Set new direction

		const direction = (ordering == 'ASC') ? 'down' : 'up'

		orderArrow.setAttribute('data-direction', direction)
		orderArrow.title = captitalise(direction)

		// Set right image and style

		if (direction == 'up') {
			orderArrow.src = '/admin-panel/img/arrow-up.png'
		} else {
			orderArrow.src = '/admin-panel/img/arrow-down.png'
		}

		orderArrow.classList.remove('hidden')
	}
}

// 5.6.8 Table Filtering

interface CustomFilter {
	colName: string
	operator: string
	value: any
}

// Enable or disable a built-in filter

const setTableFilter = async (
	builtInFilterName: string,
	enabled: boolean
) => {
	if (enabled) {
		currentActiveBuiltInFilters.add(builtInFilterName)
	} else {
		currentActiveBuiltInFilters.delete(builtInFilterName)
	}

	// Refresh table

	currentTable = await getTable(currentDbName, currentTableName)

	updateTable()
}

// Map to convert user-friendly operators to JS operators
// Todo: Make sure the functions can only be accessed on strings
// Todo: Disable the input:text when is empty is selected

const operatorMap = new Map<string, string>([
	[ 'Equals', '==' ],
	[ 'Is not equal to', '!=' ],
	[ 'Is bigger than', '>' ],
	[ 'Is bigger than or equal to', '>=' ],
	[ 'Is smaller than', '<' ],
	[ 'Is smaller than or equal to', '<=' ],
	[ 'Starts with', 'startsWith' ],
	[ 'Does not start with', '!startsWith' ],
	[ 'Ends with', 'endsWith' ],
	[ 'Does not end with', '!endsWith' ],
	[ 'Contains', 'contains' ],
	[ 'Does not contain', '!contains' ],
	[ 'Is empty', 'null' ],
	[ 'Is not empty', '!null' ],
])

const reverseOperatorMap = new Map<string, string>()

for (let [ friendlyName, operator ] of operatorMap) {
	reverseOperatorMap.set(operator, friendlyName)
}

// Surround input values with quotes if needed

const parseFilterInputValue = (
	value: string,
	colName: string
) => {
	const { cols } = currentTable

	let dataType: DataType

	for (let col of cols) {
		if (col.name == colName) {
			dataType = col.dataType
			break
		}
	}

	if (dataType == undefined) {
		throw new Error(`Could not find column "${ colName }" in the current table`)
	}

	if (dataType == 'Bit' || dataType == 'Int') {
		return parseInt(value)
	} else if (dataType == 'Float') {
		return parseFloat(value)
	} else if (dataType == 'Boolean') {
		return value == 'true'
	} else {
		return value
	}
}

// Show the custom filter popup and handle the result

const setCustomFilters = async () => {
	const { cols } = currentTable

	const generateInputHTML = (
		button: 'clear' | 'delete'
	) => /* html */ `
	<div class="input">

		<div class="search no-input-filter overflow column">
			<input type="text" placeholder="Select column..." style="width: 150px">
			<div class="arrow"></div>
			<ul class="dropdown">
				${ reduceArray(cols, col => /* html */ `
				<li>${ col.name }</li>
				`) }
			</ul>
		</div>

		<div class="search no-input-filter overflow operator">
			<input type="text" placeholder="Select operator...">
			<div class="arrow"></div>
			<ul class="dropdown">
				${ reduceMap(operatorMap, userFriendlyOperator => /* html */ `
				<li>${ userFriendlyOperator }</li>
				`) }
			</ul>
		</div>

		<input class="value dark" type="text" style="width: 150px" placeholder="Value">

		${ (button == 'clear') ? /* html */ `
		<button class="red" onclick="clearFilter(this)">Clear filter</button>
		` : /* html */ `
		<button class="red" onclick="deleteFilter(this)">Delete filter</button>
		` }

	</div>
	`

	const popupId = randomString(10)

	document.body.insertAdjacentHTML('beforeend', /* html */ `
	<div class="popup" data-id="${ popupId }">
		<a class="popup-close-button" onclick="removePopup()">✕</a>
		<h1 class="popup-title">Set Filters</h1>

		<div class="inputs">
			${ generateInputHTML('clear') }
		</div>

		<br>
		<button class="plus add-filter" onclick="addFilter(this)">Add a filter</button>
		<br><br>
		<button class="small" onclick="setFilters(this)">Set</button>
	</div>
	`)

	;(window as any).addFilter = (
		buttonEl: HTMLButtonElement
	) => {
		const inputContainer = buttonEl.parentElement.$('.inputs')

		inputContainer.insertAdjacentHTML('beforeend', generateInputHTML('delete'))

		initSearchBoxes()
	}

	;(window as any).deleteFilter = (
		buttonEl: HTMLInputElement
	) => {
		const inputs = buttonEl.parentElement
		inputs.remove()
	}

	;(window as any).clearFilter = (
		buttonEl: HTMLInputElement
	) => {
		const inputContainer = buttonEl.parentElement as HTMLSpanElement
		const inputs = inputContainer.$a<HTMLInputElement>('input')

		for (let input of inputs) {
			input.value = ''
		}
	}

	;(window as any).removePopup = () => {
		popupEl.classList.add('closed')

		setTimeout(() => {
			popupEl.remove()
		}, 300)
	}

	const popupEl = $(`.popup[data-id="${ popupId }"]`)

	// Show existing filters

	for (let i = 0; i < currentCustomFilters.length; i++) {
		const filter = currentCustomFilters[i]

		const inputRows = popupEl.$a('.inputs .input')
		const lastInputRow = inputRows[inputRows.length - 1]

		// Set values

		const colInput = lastInputRow.$<HTMLInputElement>('.column input')
		const operatorInput = lastInputRow.$<HTMLInputElement>('.operator input')
		const valueInput = lastInputRow.$<HTMLInputElement>('input.value')

		colInput.value = filter.colName
		operatorInput.value = reverseOperatorMap.get(filter.operator)
		valueInput.value = filter.value

		// Create new input row

		if (i != currentCustomFilters.length - 1) {
			(window as any).addFilter(popupEl.$('.add-filter'))
		}
	}

	initSearchBoxes()

	;(window as any).setFilters = async (
		buttonEl: HTMLInputElement
	) => {
		// Get all inputs

		const inputs = buttonEl.parentElement.$a<HTMLDivElement>('.inputs .input')

		// Reset current custom filters

		currentCustomFilters = []

		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i]

			// Get and parse input values

			const colName = input.$<HTMLInputElement>('.column input').value

			// Skip if colName is empty

			if (colName == '') {
				continue
			}

			const operator = operatorMap.get(input.$<HTMLInputElement>('.operator input').value)

			const value = parseFilterInputValue(
				input.$<HTMLInputElement>('input.value').value,
				colName
			)

			// Push the filter to the current custom filters

			currentCustomFilters.push({
				colName, operator, value
			})
		}

		// Remove the popup from the screen

		popupEl.classList.add('closed')

		setTimeout(() => {
			popupEl.remove()
		}, 300)

		// Update the table

		currentTable = await getTable(currentDbName, currentTableName, [])

		updateTable()
	}
}

// 5.6.9 Update Row Bounds

const updateRowBounds = async () => {
	const lowerBound = +$<HTMLInputElement>('#lower-row-bound').value
	const upperBound = +$<HTMLInputElement>('#upper-row-bound').value

	currentBounds = { from: lowerBound - 1, to: upperBound - 1 }

	// Refetch the table

	currentTable = await getTable(currentDbName, currentTableName, [])
	updateTable()
}

// 5.6.10 Download Table to CSV

const toCSVValue = (
	value: any,
	dataType: DataType
): string => {
	if ([ 'Binary', 'Hex', 'DateTime', 'String', 'Char', 'JSON' ].includes(dataType)) {
		return value == null ? '""' : `"${ value }"`
	} else if ([ 'Int', 'Float', 'Bit' ].includes(dataType)) {
		return value == null ? '' : value.toString()
	} else if ([ 'Boolean' ].includes(dataType)) {
		return value == null ? '""' : value ? '"true"' : '"false"'
	} else {
		throw new Error(`Datatype '${ dataType }' not handled`)
	}
}

const currentTableToCSV = async () => {
	let table = currentTable

	const { totalRows } = table
	const { from, to } = currentBounds

	const popupRes = await popup(
		'Download CSV',
		`Do you want to download all ${ totalRows } rows, or only your current view (${ from } - ${ to })?`,
		[
			{
				name: 'All Rows'
			},
			{
				name: 'Current View'
			}
		]
	)

	if (popupRes.buttonName == 'All Rows') {
		// Get the whole current table

		currentBounds = {
			from: null,
			to: null
		}

		table = await getTable(currentDbName, currentTableName)

		// Reset the bounds

		currentBounds = { from, to }
	}

	const { cols, rows } = table
	let csv = ''

	// Add columns

	for (let i = 0; i < cols.length; i++) {
		const delimiter = (i == cols.length - 1) ? '\n' : ','
		const col = cols[i]

		csv += col.name + delimiter
	}

	// Add rows

	for (let row of rows) {
		for (let i = 0; i < cols.length; i++) {
			const delimiter = (i == cols.length - 1) ? '\n' : ','
			const col = cols[i]
			const value = toCSVValue(row[col.name], col.dataType)

			csv += value + delimiter
		}
	}

	return csv
}

const downloadTableToCSV = async () => {
	const csv = await currentTableToCSV()

	// Create a File from the csv string

	const file = new File([ csv ], `csv-download.csv`, { type: 'text/csv' })

	// Create fake download button

	const downloadButton = document.createElement('a')
	downloadButton.href = URL.createObjectURL(file)
	downloadButton.download = 'csv-download.csv'

	// Add the fake download button to the page

	document.body.appendChild(downloadButton)

	// Click the fake download button

	downloadButton.click()

	// Remove the fake download button from the page

	downloadButton.remove()
}

// 5.6.11 Import to Table from CSV

const importRowsFromCSV = () => {
	// Create fake upload button

	const uploadButton = document.createElement('input')
	uploadButton.type = 'file'
	uploadButton.style.display = 'none'

	// Add the fake upload button to the page

	document.body.appendChild(uploadButton)

	// Click the fake upload button

	uploadButton.click()

	// Handle the uploaded file

	uploadButton.addEventListener('change', async () => {
		const file = uploadButton.files[0]

		if (file != null) {
			const suToken = await getSuToken()
			const dbName = currentDbName
			const tableName = currentTableName

			notification(
				'Importing CSV file...',
				'This process can take a minute, please wait...',
				Infinity
			)

			try {
				await request(
					'/admin-panel/workers/database/table/import-from-csv.node.js',
					{ suToken, dbName, tableName },
					[ file ]
				)

				notification(
					'CSV file imported',
					'CSV file was successfully imported!',
				)
			} catch {
				notification(
					'CSV import failed',
					'Some or all rows might be missing.'
				)
			}

			// Refetch the table

			currentTable = await getTable(currentDbName, currentTableName, [])
			updateTable()
		}

		// Remove the fake upload button

		uploadButton.remove()
	})
}

/* ===================
	6. User Management
=================== */

interface User {
	id: number
	name: string
}

/*
	6.1 Fetch Users
*/

const fetchUsers = async () => {
	const suToken = await getSuToken()

	const result = await request('/admin-panel/workers/user-management/get-users.node.js', {
		suToken
	})

	return JSON.parse(result) as User[]
}

/*
	6.2 Show User Management Panel
*/

const showUserManagement = async () => {
	showLoader()

	const users = await fetchUsers()

	$('.main').innerHTML = /* html */ `
	<h1>Users</h1>

	<div class="table-container">
		<table class="fullwidth">
			<thead>
				<tr>
					<td class="col-id">User ID</td>
					<td class="col-name">Username</td>
					<td class="col-options"></td>
				</tr>
			</thead>
			<tbody>
			${
				reduceArray(users, user => /* html */ `
				<tr>
					<td class="col-id">${ user.id }</td>
					<td class="col-name">${ user.name }</td>
					<td class="col-options">
						<button class="small" onclick="changePassword(${ user.id }, '${ user.name }')">Change Password</button>
						<button class="small red" onclick="deleteUser(${ user.id }, '${ user.name }')">Delete</button>
					</td>
				</tr>
				`)
			}
			</tbody>
		</table>
	</div>
	<br>
	<button class="small" onclick="addUser()">Add User</button>
	`

	setSearchParams({
		tab: 'user-management'
	})
}

/*
	6.3 Change User's Password
*/

const changePassword = async (
	userID: number,
	userName: string
) => {
	const suToken = await getSuToken()

	const popupRes = await popup(
		'Changing Password',
		`Enter a new password for user ${ userName }`,
		[
			{
				name: 'Enter'
			}
		],
		[
			{
				name: 'old-password',
				placeholder: 'Enter the user\'s current password...',
				type: 'password'
			},
			{
				name: 'password',
				placeholder: 'Enter a new password...',
				type: 'password'
			},
			{
				name: 'confirmed-password',
				placeholder: 'Confirm the new password...',
				type: 'password',
				enterTriggersButton: 'Enter'
			}
		]
	)

	const oldPassword = popupRes.inputs.get('old-password')
	const newPassword = popupRes.inputs.get('password')
	const confirmedPassword = popupRes.inputs.get('confirmed-password')

	if (newPassword == confirmedPassword) {
		try {
			await request('/admin-panel/workers/user-management/change-user-password.node.js', {
				suToken, userID, oldPassword, newPassword
			})

			notification(
				'Changed Password',
				`Successfully changed ${ userName }'s password!`
			)
		} catch(err) {
			handleRequestError(err)
		}
	} else {
		notification(
			'Error',
			'The passwords you entered did not match. Please try again.'
		)
	}
}

/*
	6.4 Delete User
*/

const deleteUser = async (
	userID: number,
	userName: string
) => {
	const suToken = await getSuToken()

	const popupRes = await popup(
		'Deleting User',
		`Are you sure you want to delete user ${ userName }?`,
		[
			{
				name: 'Delete User',
				classes: [ 'red' ]
			},
			{
				name: 'Cancel'
			}
		]
	)

	if (popupRes.buttonName == 'Delete User') {
		try {
			await request('/admin-panel/workers/user-management/delete-user.node.js', {
				suToken, userID
			})

			showUserManagement()
		} catch(err) {
			handleRequestError(err)
		}
	}
}

/*
	6.5 Add User
*/

const addUser = async () => {
	const suToken = await getSuToken()

	const popupRes = await popup(
		'Adding User',
		'Please fill out the details of the new user.',
		[
			{
				name: 'Add User'
			}
		],
		[
			{
				name: 'username',
				type: 'text',
				placeholder: 'Enter username...'
			},
			{
				name: 'password',
				type: 'password',
				placeholder: 'Enter password...'
			},
			{
				name: 'confirmed-password',
				type: 'password',
				placeholder: 'Confirm password...'
			}
		]
	)

	const username = popupRes.inputs.get('username')
	const password = popupRes.inputs.get('password')
	const confirmedPassword = popupRes.inputs.get('confirmed-password')

	if (password == confirmedPassword) {
		try {
			await request('/admin-panel/workers/user-management/add-user.node.js', {
				suToken, username, password
			})

			showUserManagement()
		} catch(err) {
			handleRequestError(err)
		}
	} else {
		notification(
			'Error',
			'The passwords you entered did not match. Please try again.'
		)
	}

}