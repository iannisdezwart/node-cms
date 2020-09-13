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
            5.6.2 Parse Input Value
            5.6.3 Edit Row
            5.6.4 Update Row
            5.6.5 Delete Row
            5.6.6 Add Row
            5.6.7 Table Ordering
            5.6.8 Table Filtering
            5.6.9 Download Table to CSV

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
    const username = Cookies.get('username');
    goToTheRightPage();
    if (username == undefined) {
        // Login
        await login();
    }
    // Set the greeting
    const greetingLI = $('#greeting');
    greetingLI.innerText = `Welcome, ${Cookies.get('username')}!`;
};
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
    });
    return '';
};
/*

    2.1 Common Types

*/
let pagesDB;
/*

    2.2 Common Functions

*/
const fetchPages = () => new Promise(async (resolve) => {
    const suToken = await getSuToken();
    request('/admin-panel/workers/get-pages.node.js', {
        suToken
    })
        .then(res => {
        pagesDB = JSON.parse(res);
        resolve();
    })
        .catch(handleRequestError);
});
const pageHistory = new Stack();
pageHistory.push(window.location.origin + '/admin-panel/');
const setSearchParams = (params) => {
    let newSearchQuery = '?';
    for (let paramName in params) {
        const paramValue = params[paramName];
        newSearchQuery += `${paramName}=${paramValue.toString()}&`;
    }
    // Remove trailing ampersand
    newSearchQuery = newSearchQuery.substring(0, newSearchQuery.length - 1);
    const newURL = window.location.origin + window.location.pathname + newSearchQuery;
    // Set the URL of the page without reloading it
    window.history.pushState({ path: newURL }, '', newURL);
    // Save new URL in pageHistory
    if (pageHistory.size > 0) {
        if (pageHistory.top.data != window.location.href) {
            pageHistory.push(window.location.href);
        }
    }
    else {
        pageHistory.push(window.location.href);
    }
};
const goBackInHistory = () => {
    if (pageHistory.size > 1) {
        pageHistory.pop();
    }
    if (pageHistory.size > 0) {
        const prevUrl = pageHistory.pop();
        // Set the URL of the page without reloading it
        window.history.pushState({ path: prevUrl }, '', prevUrl);
        goToTheRightPage();
    }
};
const goToTheRightPage = () => {
    const searchParams = new URLSearchParams(document.location.search);
    const tab = searchParams.get('tab');
    if (tab == null) {
        goToHomepage();
    }
    else if (tab == 'pages') {
        showPages();
    }
    else if (tab == 'edit-page') {
        const pageId = parseInt(searchParams.get('page-id'));
        if (pageId == null) {
            showPages();
        }
        else {
            editPage(pageId);
        }
    }
    else if (tab == 'delete-page') {
        const pageId = parseInt(searchParams.get('page-id'));
        if (pageId == null) {
            showPages();
        }
        else {
            deletePage(pageId);
        }
    }
    else if (tab == 'add-page') {
        const pageType = searchParams.get('page-type');
        if (pageType == null) {
            showPages();
        }
        else {
            addPage(pageType);
        }
    }
    else if (tab == 'file-manager') {
        const path = searchParams.get('path');
        showFiles(path);
    }
    else if (tab == 'database-overview') {
        showDatabaseList();
    }
    else if (tab == 'show-database') {
        const dbName = searchParams.get('db-name');
        showTableListOfDatabase(dbName);
    }
    else if (tab == 'show-database-table') {
        const dbName = searchParams.get('db-name');
        const tableName = searchParams.get('table-name');
        showTable(dbName, tableName);
    }
    else if (tab == 'user-management') {
        showUserManagement();
    }
};
// Handle back- and forward button
addEventListener('popstate', goBackInHistory);
// Handle reload
addEventListener('beforeunload', async () => {
    const req = await request('/admin-panel/workers/get-refresh-token', {});
    const refreshToken = req;
    Cookies.set('refresh-token', refreshToken);
});
const goToHomepage = () => {
    // Todo: make homepage
    setSearchParams({});
    $('.main').innerHTML = /* html */ `

	`;
};
const reduceArray = (arr, f) => {
    let output = '';
    for (let i = 0; i < arr.length; i++) {
        output += f(arr[i], i);
    }
    return output;
};
const reduceObject = (obj, f) => {
    let output = '';
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            output += f(i);
        }
    }
    return output;
};
const reduceMap = (map, f) => {
    let output = '';
    for (let [key, value] of map) {
        output += f(key, value);
    }
    return output;
};
const showLoader = () => {
    $('.main').innerHTML = /* html */ `
	<div class="loader"></div>
	`;
};
/* ===================
    3. Page Manager
=================== */
/*

    3.1 Show Pages

*/
const showPages = () => {
    showLoader();
    fetchPages()
        .then(() => {
        const { pages, pageTypes } = pagesDB;
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
					${reduceArray(pageTypes, pageType => {
            const pagesOfCurrentType = pages.filter(page => page.pageType == pageType.name);
            return /* html */ `
						${pageType.canAdd ? /* html */ `
						<tr class="thick-border">
							<td>${captitalise(pageType.name)}</td>
							<td class="col-options">
								<button class="small" onclick="addPage('${pageType.name}')">Add page</button>
							</td>
							<td></td>
							<td></td>
						</tr>
						` : ''}
						${reduceArray(pagesOfCurrentType, (page, i) => /* html */ `
						<tr class="page-row ${!pageType.canAdd ? 'thick-border' : ''}">
							<td>
								${pageType.canAdd ? `${'&nbsp;'.repeat(pageType.name.length)} > ${page.pageContent.title}` : captitalise(pageType.name)}
							</td>
							<td class="col-options">
								<button class="small" onclick="editPage(${page.id})">Edit</button>
								${pageType.canAdd ? /* html */ `
								<button class="small red" onclick="deletePage(${page.id})">Delete</button>
								` : ''}
							</td>
							<td>
								${(i != 0) ? /* html */ `
								<img class="clickable-icon" src="/admin-panel/img/arrow-up.png" alt="up" title="move up" style="margin-right: .5em" onclick="movePage('UP', '${pageType.name}', ${i})">
								` : ''}
							</td>
							<td>
								${(i != pagesOfCurrentType.length - 1) ? /* html */ `
								<img class="clickable-icon" src="/admin-panel/img/arrow-down.png" alt="down" title="move down" onclick="movePage('DOWN', '${pageType.name}', ${i})">
								` : ''}
							</td>
						</tr>
						`)}
						`;
        })}
					</tbody>
				</table>
			</div>
			`;
        window.movePage = async (direction, pageTypeName, index) => {
            const pagesOfCurrentType = pages.filter(_page => _page.pageType == pageTypeName);
            const page1 = pagesOfCurrentType[index];
            const page2 = (direction == 'UP')
                ? pagesOfCurrentType[index - 1]
                : pagesOfCurrentType[index + 1];
            const suToken = await getSuToken();
            if (suToken == undefined) {
                // User cancelled
                throw new Error(`User cancelled`);
            }
            await request('/admin-panel/workers/swap-pages.node.js', {
                suToken, page1, page2
            })
                .catch(handleRequestError);
            showPages();
        };
        setSearchParams({
            tab: 'pages'
        });
    })
        .catch(handleRequestError);
};
/*

    3.2 Edit Page

*/
const editPage = async (id) => {
    showLoader();
    await fetchPages();
    const page = pagesDB.pages.find(el => el.id == id);
    const { template } = pagesDB.pageTypes.find(el => el.name == page.pageType);
    $('.main').innerHTML = /* html */ `
	<h1>Editing page "${page.pageContent.title}"</h1>

	${reduceObject(template, input => /* html */ `
	<br/><br/>
	<h2>${input}:</h2>
	${pageTemplateInputToHTML(template[input], input, page.pageContent[input])}
	`)}

	<br/><br/>
	<button id="submit-changes" onclick="handleSubmit()">Save Page</button>
	`;
    // 3.2.1 Save Page
    const savePage = async (pageContent, pageId) => {
        const suToken = await getSuToken();
        if (suToken == undefined) {
            // User cancelled
            throw new Error(`User cancelled`);
        }
        await request('/admin-panel/workers/update-page.node.js', {
            suToken, pageContent, pageId
        })
            .catch(err => {
            handleRequestError(err);
            throw err;
        });
    };
    window.handleSubmit = (keepEditing = false) => {
        const pageContent = collectInputs(template);
        savePage(pageContent, page.id)
            .then(() => {
            notification('Saved page', `Successfully saved page "${page.pageContent.title}"!`);
            if (!keepEditing) {
                showPages();
            }
        });
    };
    setSearchParams({
        tab: 'edit-page',
        'page-id': page.id
    });
    initTinyMCE();
};
/*

    3.3 Add Page

*/
const addPage = async (pageType) => {
    showLoader();
    await fetchPages();
    const { template } = pagesDB.pageTypes.find(el => el.name == pageType);
    $('.main').innerHTML = /* html */ `
	<h1>Creating new page of type "${pageType}"</h1>

	${reduceObject(template, (input) => /* html */ `
	<br/><br/>
	<h2>${input}:</h2>
	${pageTemplateInputToHTML(template[input], input, '')}
	`)}

	<br/><br/>
	<button id="add-page" onclick="handleSubmit('${pageType}')">Add Page</button>
	`;
    window.handleSubmit = () => {
        const pageContent = collectInputs(template);
        getSuToken()
            .then(suToken => {
            request('/admin-panel/workers/add-page.node.js', {
                suToken, pageType, pageContent
            })
                .then(() => {
                notification('Added page', `Successfully added page "${pageContent.title}"!`);
                showPages();
            })
                .catch(handleRequestError);
        });
    };
    initTinyMCE();
    setSearchParams({
        tab: 'add-page',
        'page-type': pageType
    });
};
/*

    3.4 Delete Page

*/
const deletePage = async (id) => {
    showLoader();
    await fetchPages();
    const page = pagesDB.pages.find(el => el.id == id);
    await popup(`Deleting page "${page.pageContent.title}"`, 'Are you sure you want to delete this page?', [
        {
            name: 'Delete Page',
            classes: ['red']
        }
    ]);
    const suToken = await getSuToken();
    request('/admin-panel/workers/delete-page.node.js', {
        suToken,
        pageId: page.id
    })
        .then(() => {
        notification('Deleted page', `Successfully deleted page "${page.pageContent.title}"!`);
        showPages();
    })
        .catch(handleRequestError);
    setSearchParams({
        tab: 'delete-page',
        'page-id': id
    });
};
/*

    3.5 Page Template Input To HTML

*/
const pageTemplateInputToHTML = (inputType, inputName, inputContent) => {
    switch (inputType) {
        case 'text': {
            return /* html */ `
			<textarea id="${inputName}" data-input="${inputName}">
				${inputContent}
			</textarea>
			`;
        }
        case 'string': {
            return /* html */ `
			<input id="${inputName}" data-input="${inputName}" type="text" value="${inputContent}" />
			`;
        }
        case 'img[]': {
            const imgs = inputContent;
            return /* html */ `
			<div class="img-array" id="${inputName}" data-input="${inputName}">
				${reduceArray(imgs, (img, i) => generateImgArrayImg(img, (i != 0), (i != imgs.length - 1)))}
				<div class="img-array-plus" onclick="addImg('${inputName}')"></div>
			</div>
			`;
        }
        case 'img': {
            const img = inputContent;
            return /* html */ `
			<div class="img-array" id="${inputName}" data-input="${inputName}">
				${generateImgArrayImg(img, false, false)}
			</div>
			`;
        }
        case 'video': {
            const videoPath = inputContent;
            return /* html */ `
			<video src="${videoPath}" data-path=${videoPath} height="200"></video>
			<button class="small" onclick="editVideoPath(this)">Edit</button>
			`;
        }
        case 'date': {
            const date = new Date(inputContent);
            const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            return /* html */ `
			<input id="${inputName}" data-input="${inputName}" type="date" value="${dateString}">
			`;
        }
    }
};
// 3.5.1 Generate .img-array-img Element
const generateImgArrayImg = (imgSrc, hasLeftArrow, hasRightArrow) => /* html */ `
<div class="img-array-img">
	<div class="img-array-img-options">
		<button class="small light" onclick="editImg(this)">Edit</button>
		<button class="small light red" onclick="deleteImg(this)">Delete</button>
	</div>
	<div class="img-array-img-arrows">
		${(hasLeftArrow) ? /* html */ `
		<img class="arrow-left" src="/admin-panel/img/arrow-left.png" alt="arrow-left" onclick="moveImg('left', this)">
		` : ''}
		${(hasRightArrow) ? /* html */ `
		<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImg('right', this)">
		` : ''}
	</div>
	<img class="img" data-path="${imgSrc}" src="${imgSrc}">
</div>
`;
// 3.5.2 Edit Video Path
const editVideoPath = async (buttonEl) => {
    // Select a new video
    const newVideoPath = await filePicker({
        type: 'file',
        title: 'Edit video',
        body: 'Select a new video',
        buttonText: 'Select',
        extensions: videoExtensions
    }, false)
        .catch(() => {
        throw new Error(`User cancelled`);
    });
    // Update the old video
    const videoEl = buttonEl.parentElement.querySelector('video');
    videoEl.setAttribute('data-path', `/content${newVideoPath}`);
    videoEl.src = `/content${newVideoPath}`;
};
/*

    3.6 Collect Page Template Inputs

*/
const collectInputs = (template) => {
    // Get all input elements
    const elements = document.querySelectorAll('[data-input]');
    const pageContent = {};
    // Parse inputs
    for (let i = 0; i < elements.length; i++) {
        const inputKey = elements[i].getAttribute('data-input');
        const inputType = template[inputKey];
        let inputValue;
        if (inputType == 'text') {
            inputValue = tinyMCE.get(inputKey).getContent();
        }
        else if (inputType == 'string') {
            inputValue = elements[i].value.trim();
        }
        else if (inputType == 'img[]') {
            inputValue = [];
            const imgs = elements[i].querySelectorAll('.img');
            for (let j = 0; j < imgs.length; j++) {
                inputValue[j] = imgs[j].getAttribute('data-path');
            }
        }
        else if (inputType == 'img') {
            inputValue = elements[i]
                .querySelector('.img')
                .getAttribute('data-path');
        }
        else if (inputType == 'video') {
            inputValue = elements[i].getAttribute('data-path');
        }
        else if (inputType == 'date') {
            inputValue = new Date(elements[i].value).getTime();
        }
        pageContent[inputKey] = inputValue;
    }
    return pageContent;
};
/*

    3.7 img[] Functions

*/
// 3.7.1 Move Image
const moveImg = async (direction, arrowEl) => {
    const imgArrayImgEl = arrowEl.parentElement.parentElement;
    // Swap images visually
    // Get the first image element that has to move
    const imgEl1 = imgArrayImgEl.querySelector('.img');
    // Get the other image element
    const imgEl2 = (direction == 'left')
        ? imgArrayImgEl.previousElementSibling.querySelector('.img')
        : imgArrayImgEl.nextElementSibling.querySelector('.img');
    // Swap the images
    imgEl2.parentElement.appendChild(imgEl1);
    imgArrayImgEl.appendChild(imgEl2);
};
// 3.7.2 Edit Image
const editImg = async (buttonEl) => {
    // Select a new image
    const newImgPath = await filePicker({
        type: 'file',
        title: 'Edit image',
        body: 'Select a new image',
        buttonText: 'Select',
        extensions: imageExtensions
    }, false)
        .catch(() => {
        throw new Error(`User cancelled`);
    });
    // Update the old image
    // Todo: show loader while image is loading
    const imgEl = buttonEl.parentElement.parentElement.querySelector('.img');
    imgEl.setAttribute('data-path', `/content${newImgPath}`);
    imgEl.src = `/content${newImgPath}`;
};
// 3.7.3 Delete Image
const deleteImg = async (buttonEl) => {
    const imgArrayImgEl = buttonEl.parentElement.parentElement;
    // Get left and right imgs (which can be null)
    const leftImgEl = imgArrayImgEl.previousElementSibling;
    const rightImgEl = imgArrayImgEl.nextElementSibling;
    // Remove the image
    imgArrayImgEl.remove();
    // Update the arrows of the left and right imgs if necessary
    if (leftImgEl == null) {
        rightImgEl.querySelector('.arrow-left').remove();
    }
    if (rightImgEl != null) {
        if (!rightImgEl.classList.contains('img-array-img')) {
            leftImgEl.querySelector('.arrow-right').remove();
        }
    }
};
// 3.7.4 Add Image
const addImg = async (inputName) => {
    // Select a new image
    const newImgPath = await filePicker({
        type: 'file',
        title: 'Add image',
        body: 'Select a new image',
        buttonText: 'Select',
        extensions: imageExtensions
    }, false)
        .catch(() => {
        throw new Error(`User cancelled`);
    });
    // Get the .img-array-plus element
    const imgArrayPlus = $(`[data-input="${inputName}"`).querySelector('.img-array-plus');
    // Add the image before it
    imgArrayPlus.insertAdjacentHTML('beforebegin', generateImgArrayImg(`/content${newImgPath}`, (imgArrayPlus.previousElementSibling != null), false));
    // Add a right arrow to the previous image if it exists
    const prevImgArrayImg = imgArrayPlus.previousElementSibling.previousElementSibling;
    if (prevImgArrayImg != null) {
        prevImgArrayImg.querySelector('.img-array-img-arrows').innerHTML += /* html */ `
		<img class="arrow-right" src="/admin-panel/img/arrow-right.png" alt="arrow-right" onclick="moveImg('right', this)">
		`;
    }
};
/* ===================
    4. File Manager
=================== */
/*

    4.1 Upload Files

*/
const uploadFiles = (fileList, path = '/') => new Promise(resolve => {
    getSuToken()
        .then(suToken => {
        const files = [];
        const body = {
            suToken,
            path
        };
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            // Add each file to the files array
            files.push(file);
        }
        // Create progressbar
        const progressBar = new ProgressBar();
        // Send the request
        request('/admin-panel/workers/fileupload.node.js', body, files, {
            onRequestUploadProgress: e => progressBar.set(e.loaded / e.total)
        })
            .then(() => {
            progressBar.remove();
            resolve();
        })
            .catch(handleRequestError);
    });
});
/*

    4.2 Drop Area

*/
const initDropArea = (path = '/') => new Promise(resolve => {
    const dropArea = $('.drop-area');
    const hiddenUploadInput = document.createElement('input');
    hiddenUploadInput.type = 'file';
    hiddenUploadInput.multiple = true;
    hiddenUploadInput.style.visibility = 'hidden';
    hiddenUploadInput.onchange = () => {
        uploadFiles(hiddenUploadInput.files, path)
            .then(resolve);
    };
    dropArea.appendChild(hiddenUploadInput);
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const highlight = () => {
        dropArea.classList.add('highlighted');
    };
    const unhighlight = () => {
        dropArea.classList.remove('highlighted');
    };
    const drop = (e) => {
        const { dataTransfer } = e;
        const { files } = dataTransfer;
        // Todo: upload folders https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
        uploadFiles(files, path)
            .then(resolve);
    };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(event => {
        dropArea.addEventListener(event, highlight, false);
    });
    ['dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, unhighlight, false);
    });
    dropArea.addEventListener('drop', drop, false);
});
const filePicker = (options, multiple) => new Promise((resolveFilePicker, rejectFilePicker) => {
    // Set defaults
    options = {
        ...{
            type: 'file',
            newFileName: 'new-file-name.txt',
            extensions: null
        },
        ...options
    };
    // Create HTML Element
    const filePickerEl = document.createElement('div');
    filePickerEl.classList.add('popup');
    filePickerEl.innerHTML = /* html */ `
	<a class="popup-close-button">✕</a>
	<h1 class="popup-title">${options.title}</h1>

	${(options.body != undefined) ? /* html */ `
	<p class="popup-body">${options.body}</p>
	` : ''}

	<div class="file-list-container">
		<ul class="file-list file-list-root">
			<li class="file-list-item file-list-root" onclick="selectLI(this)" onmouseover="hoverLI(this)" onmouseleave="hoverLI(this, false)" data-path="/">
				<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/dir.png" alt="dir" onerror="
					this.src = '${`/admin-panel/img/file-icons/unknown.png`}'; this.onerror = null
				">
				/
			</li>
		</ul>
	</div>

	${(options.type == 'new-file') ? /* html */ `
	<p>Fill in the name of the file</p>
	<input type="text" class="filepicker-new-file" value="${options.newFileName}" placeholder="Enter new file name...">
	` : ''}

	<br><br>
	<button class="small">${options.buttonText}</button>
	`;
    // 4.3.1 Create UL from files
    const createULFromFiles = (path) => new Promise(resolve => {
        getFiles(path)
            .then(files => {
            // Filter only directories if needed
            if (options.type == 'directory' || options.type == 'new-file') {
                files = files.filter(file => file.isDirectory);
            }
            // Filter extensions if needed
            if (options.extensions != null) {
                files = files.filter(file => options.extensions.has(getExtension(file.name)) || file.isDirectory);
            }
            // Create file-list UL
            const fileListEl = document.createElement('ul');
            fileListEl.classList.add('file-list');
            // Add each file to the file-list UL
            for (let file of files) {
                const { name } = file;
                const extension = (file.isDirectory)
                    ? 'dir'
                    : name.slice(name.lastIndexOf('.') + 1);
                // Create the child LI
                fileListEl.innerHTML += /* html */ `
					<li class="file-list-item" onclick="selectLI(this)" onmouseover="hoverLI(this)" onmouseleave="hoverLI(this, false)" data-path="${(file.isDirectory) ? path + file.name + '/' : path + file.name}">
						${(file.isDirectory) ? /* html */ `<span class="plus-button" data-expanded="false" onclick="expandDirectory(this)"></span>` : ''}
						<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/${extension}.png" alt="${extension}" onerror="
							this.src = '/admin-panel/img/file-icons/unknown.png';
							this.onerror = null;
						">
						${file.name}
					</li>
					`;
            }
            // 4.3.1.1 li.file-list-item hover animation
            window.hoverLI = (li, hover = true) => {
                if (event.target != li)
                    return;
                if (hover) {
                    li.classList.add('hover');
                    const hoverChangeEvent = new CustomEvent('hoverchange', {
                        detail: {
                            target: li
                        }
                    });
                    dispatchEvent(hoverChangeEvent);
                    addEventListener('hoverchange', (e) => {
                        if (e.detail.target != li) {
                            li.classList.remove('hover');
                        }
                    });
                }
                else {
                    li.classList.remove('hover');
                }
            };
            // 4.3.1.2 li.file-list-item select handler
            window.selectLI = (li) => {
                if (event.target != li)
                    return;
                if (li.getAttribute('data-selected') == 'true') {
                    li.classList.remove('selected');
                    li.setAttribute('data-selected', 'false');
                }
                else {
                    li.classList.add('selected');
                    li.setAttribute('data-selected', 'true');
                    const hoverChangeEvent = new CustomEvent('selectionchange', {
                        detail: {
                            newlySelected: li
                        }
                    });
                    dispatchEvent(hoverChangeEvent);
                    addEventListener('selectionchange', (e) => {
                        if (e.detail.newlySelected != li && !multiple) {
                            li.classList.remove('selected');
                            li.setAttribute('data-selected', 'false');
                        }
                    });
                }
            };
            // 4.3.1.3 Expand directory
            window.expandDirectory = (button) => {
                const li = button.parentElement;
                const directoryPath = li.getAttribute('data-path');
                const expanded = button.getAttribute('data-expanded');
                if (expanded == 'true') {
                    li.querySelector('ul.file-list').remove();
                    button.setAttribute('data-expanded', 'false');
                    // Decrement the margin of all parents
                    const childElementCount = parseInt(getComputedStyle(li).getPropertyValue('--files-inside'));
                    let currentLi = li;
                    while (true) {
                        const filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'));
                        // Decrement files inside
                        currentLi.style.setProperty('--files-inside', (filesInside - childElementCount).toString());
                        // Traverse backwards
                        currentLi = currentLi.parentElement.parentElement;
                        // Break if we reached the root
                        if (!currentLi.classList.contains('file-list-item')) {
                            break;
                        }
                    }
                }
                else {
                    // Todo: show loader
                    createULFromFiles(directoryPath)
                        .then(ul => {
                        li.appendChild(ul);
                        // Increment the margin of all parents
                        let currentLi = li;
                        const { childElementCount } = ul;
                        while (true) {
                            const filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'));
                            // Increment files inside
                            currentLi.style.setProperty('--files-inside', (filesInside + childElementCount).toString());
                            // Traverse backwards
                            currentLi = currentLi.parentElement.parentElement;
                            // Break if we reached the root
                            if (!currentLi.classList.contains('file-list-item')) {
                                break;
                            }
                        }
                    });
                    button.setAttribute('data-expanded', 'true');
                }
            };
            resolve(fileListEl);
        })
            .catch(handleRequestError);
    });
    // Append the File Picker UL to the popup
    createULFromFiles('/')
        .then(ul => {
        filePickerEl.querySelector('li.file-list-root').appendChild(ul);
        // Set --files-inside for li.file-list-root
        const rootLI = filePickerEl.querySelector('li.file-list-root');
        rootLI.style.setProperty('--files-inside', (ul.childElementCount).toString());
    });
    const removePopup = () => {
        filePickerEl.classList.add('closed');
        setTimeout(() => {
            filePickerEl.remove();
        }, 300);
    };
    // 4.3.2 Handle submit button click
    filePickerEl.querySelector('button').addEventListener('click', () => {
        removePopup();
        // Get all selected files
        const lis = filePickerEl.querySelectorAll('li.file-list-item');
        const filePaths = [];
        lis.forEach(li => {
            if (li.classList.contains('selected')) {
                let path = li.getAttribute('data-path');
                if (options.type == 'new-file') {
                    path += filePickerEl.querySelector('.filepicker-new-file').value;
                }
                filePaths.push(path);
            }
        });
        // Reject if there are no files, else resolve
        if (filePaths.length == 0) {
            rejectFilePicker();
        }
        else {
            if (multiple) {
                resolveFilePicker(filePaths);
            }
            else {
                resolveFilePicker(filePaths[0]);
            }
        }
    });
    // Add popup to page
    document.body.appendChild(filePickerEl);
    // Close popup when x button or escape is pressed
    filePickerEl.querySelector('a.popup-close-button').addEventListener('click', () => {
        removePopup();
        rejectFilePicker();
    });
    const escapePressHandler = (e) => {
        if (e.key == 'Escape') {
            removePopup();
            removeEventListener('keyup', escapePressHandler);
        }
    };
    addEventListener('keyup', escapePressHandler);
});
/*

    4.4 Show Files

*/
const getFiles = (path = '/') => new Promise(async (resolve, reject) => {
    const suToken = await getSuToken();
    request('/admin-panel/workers/get-files.node.js', {
        path, suToken
    })
        .then(res => {
        const fileArray = JSON.parse(res).files;
        resolve(fileArray);
    })
        .catch(res => {
        reject(res);
    });
});
const upALevel = (path) => {
    if (path.length <= 1) {
        return path;
    }
    // Remove trailing slash
    path = path.substring(0, path.length - 1);
    const lastSlash = path.lastIndexOf('/');
    return path.substring(0, lastSlash + 1);
};
const openFile = (path) => {
    window.open(`/content${path}`);
};
let checkboxStatus = 'unchecked';
let checkedCheckboxes = 0;
const allCheckboxesChecked = () => {
    const checkboxes = $a('tbody .col-checkbox input[type="checkbox"]');
    for (let checkbox of checkboxes) {
        if (!checkbox.checked) {
            return false;
        }
    }
    return true;
};
const checkAllCheckboxes = (check = true) => {
    const checkboxes = $a('tbody .col-checkbox input[type="checkbox"]');
    if (check) {
        checkboxStatus = 'checked';
    }
    else {
        checkboxStatus = 'unchecked';
    }
    checkboxes.forEach(checkbox => {
        if (checkbox.checked != check) {
            checkbox.checked = check;
            checkbox.onchange(new Event('change'));
        }
    });
};
const uncheckAllCheckboxes = () => checkAllCheckboxes(false);
const toggleAllCheckboxes = () => {
    if (allCheckboxesChecked()) {
        uncheckAllCheckboxes();
    }
    else {
        checkAllCheckboxes();
    }
};
const showFiles = (path = '/') => {
    showLoader();
    setSearchParams({
        tab: 'file-manager',
        path
    });
    getFiles(path)
        .then(files => {
        files.sort(file => file.isDirectory ? -1 : 1);
        $('.main').innerHTML = /* html */ `
			<div class="drop-area">
				<h1>Folder: ${path}</h1>

				<button class="small" onclick="showFiles(upALevel('${path}'))">Up a level</button>
				<button class="small" onclick="$('input[type=file]').click()">Upload Files</button>
				<button class="small" onclick="createNewDirectory('${path}')">New Folder</button>
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
							${reduceArray(files, file => {
            const { name } = file;
            const size = file.isDirectory ? '–' : parseSize(file.size);
            const modified = parseDate(file.modified);
            const extension = (file.isDirectory)
                ? 'dir'
                : name.slice(name.lastIndexOf('.') + 1);
            window.toggleDropdown = (el, e) => {
                const isDescendant = (child, parent) => {
                    while (child != null) {
                        if (child == parent) {
                            return true;
                        }
                        child = child.parentElement;
                    }
                    return false;
                };
                if (el == e.target) {
                    el.classList.toggle('active');
                }
                setTimeout(() => {
                    const handler = (mouseEvent) => {
                        if (!isDescendant(mouseEvent.target, el)) {
                            el.classList.remove('active');
                            document.removeEventListener('click', handler);
                        }
                    };
                    document.addEventListener('click', handler);
                }, 0);
            };
            let bulkFileActionsShown = false;
            const showBulkFileActions = () => {
                bulkFileActionsShown = true;
                $('.bulk-actions').classList.remove('hidden');
            };
            const hideBulkFileActions = () => {
                bulkFileActionsShown = false;
                $('.bulk-actions').classList.add('hidden');
            };
            window.handleFileCheckboxes = (checkboxEl) => {
                const selectAllCheckbox = $('thead .col-checkbox input[type="checkbox"]');
                if (checkboxEl.checked) {
                    checkedCheckboxes++;
                    // Check 'select all' checkbox if necessary
                    if (checkedCheckboxes == files.length) {
                        selectAllCheckbox.checked = true;
                    }
                }
                else {
                    checkedCheckboxes--;
                    // Uncheck 'select all' checkbox if necessary
                    if (checkedCheckboxes == files.length - 1) {
                        selectAllCheckbox.checked = false;
                    }
                }
                if (checkedCheckboxes > 0) {
                    if (!bulkFileActionsShown) {
                        showBulkFileActions();
                    }
                }
                else {
                    hideBulkFileActions();
                }
            };
            const getSelectedFiles = () => {
                const tableRows = $a('tr.file-row');
                const selectedFiles = [];
                for (let i = 0; i < tableRows.length; i++) {
                    const checkboxEl = tableRows[i].querySelector('input[type="checkbox"]');
                    if (checkboxEl.checked) {
                        selectedFiles.push(files[i]);
                    }
                }
                return selectedFiles;
            };
            window.bulkDeleteFiles = () => {
                const selectedFiles = getSelectedFiles();
                popup('Deleting multiple files', `Are you sure you want to delete ${numifyNoun(selectedFiles.length, 'file', 'files')}?
											<codeblock>${reduceArray(selectedFiles, f => f.name + '<br>')}</codeblock>`, [
                    {
                        name: 'Delete',
                        classes: ['red']
                    },
                    {
                        name: 'Cancel'
                    },
                ])
                    .then(popupRes => {
                    if (popupRes.buttonName == 'Delete') {
                        getSuToken()
                            .then(suToken => {
                            const filePaths = selectedFiles.map(f => path + f.name);
                            request('/admin-panel/workers/delete-multiple-files.node.js', {
                                suToken,
                                filePaths
                            })
                                .then(() => {
                                // Refresh files
                                showFiles(path);
                            })
                                .catch(handleRequestError);
                        });
                    }
                });
            };
            window.bulkCopyFiles = () => {
                const selectedFiles = getSelectedFiles();
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
                            sources: selectedFiles.map(selectedFile => selectedFile.path),
                            destination: selectedFolder
                        })
                            .then(() => {
                            notification('Copied Files', `Succesfully copied ${numifyNoun(selectedFiles.length, 'file', 'files')} to <code>${selectedFolder}</code>`);
                            // Refresh files
                            showFiles(path);
                        })
                            .catch(res => {
                            // This should never happen
                            notification('Unspecified Error', `status code: ${res.status}, body: <code>${res.response}</code>`);
                        });
                    });
                })
                    .catch(() => {
                    // User cancelled
                });
            };
            window.bulkMoveFiles = () => {
                const selectedFiles = getSelectedFiles();
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
                            sources: selectedFiles.map(selectedFile => selectedFile.path),
                            destination: selectedFolder
                        })
                            .then(() => {
                            notification('Moved Files', `Succesfully moved ${numifyNoun(selectedFiles.length, 'file', 'files')} to <code>${selectedFolder}</code>`);
                            // Refresh files
                            showFiles(path);
                        })
                            .catch(res => {
                            // This should never happen
                            notification('Unspecified Error', `status code: ${res.status}, body: <code>${res.response}</code>`);
                        });
                    });
                })
                    .catch(() => {
                    // User cancelled
                });
            };
            return /* html */ `
									<tr class="file-row">
										<td class="col-checkbox">
											<input type="checkbox" onchange="handleFileCheckboxes(this)">
										</td>

										<td class="col-icon">
											<img class="file-manager-file-icon" src="/admin-panel/img/file-icons/${extension}.png" alt="${extension}" onerror="
												this.src = '${`/admin-panel/img/file-icons/unknown.png`}'; this.onerror = null
											">
										</td>

										<td class="col-name" onclick="
											${file.isDirectory} ? showFiles('${path + file.name}/') : openFile('${path + file.name}')
										">
											${file.name}
										</td>

										<td class="col-size">
											${file.isDirectory ? file.filesInside + ' items' : size}
										</td>

										<td class="col-modified">
											${modified}
										</td>

										<td class="col-options">
											<button class="small" onclick="copyFile('${path + file.name}')">Copy</button>
											<button class="small" onclick="moveFile('${path + file.name}')">Move</button>
											<button class="small" onclick="renameFile('${path + file.name}')">Rename</button>
											<button class="small red" onclick="deleteFile('${path + file.name}')">Delete</button>
										</td>
									</tr>
									`;
        })}
						</tbody>

					</table>
				</div>
			</div>
			`;
        initDropArea(path)
            .then(() => {
            // On file upload, refresh files
            showFiles(path);
        });
    })
        .catch(handleRequestError);
};
/*

    4.5 Delete File

*/
const deleteFile = (filePath) => {
    popup('Deleting file', `Are you sure you want to delete file: <code>${filePath}</code>?`, [
        {
            name: 'Delete',
            classes: ['red']
        },
        {
            name: 'Cancel'
        },
    ])
        .then(popupRes => {
        if (popupRes.buttonName == 'Delete') {
            getSuToken()
                .then(suToken => {
                request('/admin-panel/workers/delete-file.node.js', {
                    suToken,
                    filePath
                })
                    .then(() => {
                    showFiles(new URLSearchParams(document.location.search).get('path'));
                })
                    .catch(handleRequestError);
            });
        }
    });
};
/*

    4.6 Copy File and Move File

*/
const copyFile = (sourcePath) => copyOrMoveFile(sourcePath, 'copy');
const moveFile = (sourcePath) => copyOrMoveFile(sourcePath, 'move');
// 4.6.1 Copy / Move File With Different Name
const copyOrMoveFile = async (sourcePath, mode) => {
    try {
        const destinationPath = await filePicker({
            type: 'new-file',
            title: `${captitalise(mode)} File`,
            body: `Select a folder to where you want to ${mode} the file`,
            buttonText: 'Select folder',
            newFileName: sourcePath.substring(sourcePath.lastIndexOf('/') + 1)
        }, false);
        const suToken = await getSuToken();
        await request(`/admin-panel/workers/${mode}-file-different-name.node.js`, {
            suToken,
            source: sourcePath,
            destination: destinationPath
        })
            .catch(err => {
            // This should never happen
            notification('Unspecified Error', `status code: ${err.status}, body: <code>${err.response}</code>`);
            throw err;
        });
        const pastSimpleVerb = (mode == 'copy') ? 'copied' : 'moved';
        notification(`${captitalise(pastSimpleVerb)} File`, `Succesfully ${pastSimpleVerb} file <code>${sourcePath}</code> to <code>${destinationPath}</code>`);
        // Refresh files
        showFiles(new URLSearchParams(document.location.search).get('path'));
    }
    catch (err) {
        // User cancelled
    }
};
/*

    4.7 Rename File

*/
const renameFile = async (sourcePath) => {
    const popupRes = await popup(`Renaming File`, `Enter a new name for <code>${sourcePath.substring(sourcePath.lastIndexOf('/') + 1)}</code>`, [
        {
            name: 'Rename'
        }
    ], [
        {
            name: 'new-name',
            placeholder: 'Enter a new name...',
            type: 'text',
            value: sourcePath.substring(sourcePath.lastIndexOf('/') + 1),
            enterTriggersButton: 'Rename'
        }
    ]);
    if (popupRes.buttonName == 'Rename') {
        const newName = popupRes.inputs.get('new-name');
        const dirPath = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);
        const destinationPath = dirPath + newName;
        const suToken = await getSuToken();
        await request('/admin-panel/workers/move-file-different-name.node.js', {
            suToken,
            source: sourcePath,
            destination: destinationPath
        })
            .catch(err => {
            // This should never happen
            notification('Unspecified Error', `status code: ${err.status}, body: <code>${err.response}</code>`);
            throw err;
        });
        notification(`Renamed file`, `Succesfully renamed file <code>${sourcePath}</code> to <code>${destinationPath}</code>`);
        // Refresh files
        showFiles(new URLSearchParams(document.location.search).get('path'));
    }
};
/*

    4.8 Create New Directory

*/
const createNewDirectory = async (parentDirectoryPath) => {
    const popupRes = await popup('New Folder', `Creating a new folder in <code>${parentDirectoryPath}</code>`, [
        {
            name: 'Create'
        }
    ], [
        {
            name: 'new-dir-name',
            placeholder: 'Enter a name...',
            type: 'text',
            enterTriggersButton: 'Create'
        }
    ]);
    const newDirName = popupRes.inputs.get('new-dir-name');
    const newDirectoryPath = parentDirectoryPath + newDirName;
    const suToken = await getSuToken();
    await request('/admin-panel/workers/create-new-directory.node.js', {
        suToken,
        newDirectoryPath
    })
        .catch(err => {
        // This should never happen
        notification('Unspecified Error', `status code: ${err.status}, body: <code>${err.response}</code>`);
        throw err;
    });
    notification(`Created directory`, `Succesfully created directory <code>${newDirName}</code>`);
    // Refresh files
    showFiles(new URLSearchParams(document.location.search).get('path'));
};
/*
    5.1 Get Database List
*/
const getDatabaseList = async () => {
    try {
        const suToken = await getSuToken();
        const response = await request('/admin-panel/workers/database/list.node.js', {
            suToken
        });
        const databases = JSON.parse(response);
        return databases;
    }
    catch (err) {
        handleRequestError(err);
    }
};
/*
    5.2 Show Database List
*/
const showDatabaseList = async () => {
    showLoader();
    setSearchParams({
        tab: 'database-overview'
    });
    const databases = await getDatabaseList();
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
				${reduceArray(databases, dbInfo => /* html */ `
				<tr>
					<td class="col-icon">
						<img class="file-manager-file-icon" src="/admin-panel/img/database.png" alt="Database Icon">
					</td>
					<td class="col-name" onclick="showTableListOfDatabase('${dbInfo.name}')">${dbInfo.name.replace('.json', '')}</td>
					<td>${parseSize(dbInfo.size)}</td>
					<td>${parseDate(dbInfo.modified)}</td>
					<td class="col-options">
						<button class="small" onclick="showTableListOfDatabase('${dbInfo.name}')">View</button>
					</td>
				</tr>
				`)}
			</tbody>
		</table>
	</div>

	`;
};
const getTableListOfDatabase = async (dbName) => {
    const suToken = await getSuToken();
    try {
        const response = await request('/admin-panel/workers/database/list-tables.node.js', {
            suToken, dbName
        });
        return JSON.parse(response);
    }
    catch (err) {
        handleRequestError(err);
    }
};
/*
    5.4 Show Table List of Database
*/
const showTableListOfDatabase = async (dbName) => {
    showLoader();
    setSearchParams({
        tab: 'show-database',
        'db-name': dbName
    });
    const db = await getTableListOfDatabase(dbName);
    $('.main').innerHTML = /* html */ `
	<h1>
		<img class="inline-centered-icon" src="/admin-panel/img/database.png" alt="Database Icon">
		${dbName.replace('.json', '')}
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
				${reduceObject(db, tableName => {
        const table = db[tableName];
        const { rowCount, colCount } = table;
        return /* html */ `
					<tr>
						<td class="col-icon">
							<img class="file-manager-file-icon" src="/admin-panel/img/table.png" alt="Table Icon">
						</td>
						<td class="col-name" onclick="showTable('${dbName}', '${tableName}')">${tableName}</td>
						<td>${rowCount}</td>
						<td>${colCount}</td>
						<td class="col-options">
							<button class="small" onclick="showTable('${dbName}', '${tableName}')">View</button>
						</td>
					</tr>
					`;
    })}
			</tbody>
		</table>
	</div>

	`;
};
/*
    5.5 Get Table
*/
const getTable = async (dbName, tableName, orderArr = []) => {
    const suToken = await getSuToken();
    try {
        const response = await request('/admin-panel/workers/database/table/get.node.js', {
            suToken, dbName, tableName, orderArr
        });
        const table = JSON.parse(response);
        for (let i = 0; i < table.rows.length; i++) {
            table.rows[i].rowNum = i;
        }
        return table;
    }
    catch (err) {
        handleRequestError(err);
    }
};
/*
    5.6 Show Table
*/
let currentTable;
let currentDbName;
let currentTableName;
let currentOrderBy = new Map();
let currentFilters = new Map();
let currentBuiltInFilters = new Map();
let currentCustomFilters;
const showTable = async (dbName, tableName) => {
    showLoader();
    setSearchParams({
        tab: 'show-database-table',
        'db-name': dbName,
        'table-name': tableName
    });
    currentTable = await getTable(dbName, tableName);
    currentDbName = dbName;
    currentTableName = tableName;
    currentOrderBy.clear();
    currentFilters.clear();
    currentBuiltInFilters.clear();
    currentCustomFilters = [];
    const { data } = currentTable;
    // Get the built-in filters from the extra data of the table
    if (data != undefined) {
        if (data.filters != undefined) {
            for (let filterName in data.filters) {
                currentBuiltInFilters.set(filterName, eval(data.filters[filterName]));
            }
        }
    }
    $('.main').innerHTML = /* html */ `
	<h1>
		<img class="inline-centered-icon" src="/admin-panel/img/table.png" alt="Table Icon">
		<a class="underline" onclick="showTableListOfDatabase('${currentDbName}')">${currentDbName.replace('.json', '')}</a> > ${currentTableName}
	</h1>

	<div class="table-action-row">
		<button onclick="setCustomFilters()" class="small">Filter</button>
		<button onclick="downloadTableToCSV()" class="small">Download to CSV</button>
	</div>

	<br>

	<div class="table-container"></div>

	<h3>Built-in filters:</h3>

	<div class="built-in-filters">
		${reduceMap(currentBuiltInFilters, filterName => /* html */ `
		<input type="checkbox" onchange="setTableFilter('${filterName}', this.checked)">
		${filterName}
		<br>
		`)}
	</div>
	`;
    updateTable();
};
const updateTable = () => {
    let table = getFilteredCurrentTable();
    const { rows, cols } = table;
    $('.table-container').innerHTML = /* html */ `
	<table class="fullwidth database-table">
		<thead>
			<!-- The columns come here -->

			${reduceArray(cols, col => {
        const dataType = `Datatype: ${col.dataType}\n`;
        const constraints = (col.constraints != undefined)
            ? `Constraints: ${col.constraints.join(', ')}\n`
            : '';
        const foreignKey = (col.foreignKey != undefined)
            ? `Foreign Key: ${col.foreignKey.table}.${col.foreignKey.column}\n`
            : '';
        return /* html */ `
				<td data-col-name="${col.name}" title="${dataType}${constraints}${foreignKey}">
					${col.name}
					<img onclick="toggleOrderTable(this, '${col.name}')" class="order-direction hidden" src="/admin-panel/img/arrow-down-faded.png" data-direction="unset" title="Unset">
				</td>
				`;
    })}
			<td></td>
		</thead>
		<tbody>
			${reduceArray(rows, row => /* html */ `
			<tr data-row-num="${row.rowNum}">
				${reduceArray(cols, col => /* html */ `
				<td data-datatype="${col.dataType}" data-col-name="${col.name}" class="col">${row[col.name]}</td>
				`)}
				<td class="col-options">
					<button onclick="editRow('${currentDbName}', '${currentTableName}', ${row.rowNum})" class="small edit">Edit</button>
					<button onclick="deleteRow('${currentDbName}', '${currentTableName}', ${row.rowNum})" class="small red">Delete</button>
				</td>
			</tr>
			`)}
		</tbody>
		<tfoot>
			${reduceArray(cols, col => /* html */ `
			<td data-datatype="${col.dataType}" data-col-name="${col.name}" class="col">
				${createInputElFromDataType(col.dataType).outerHTML}
			</td>
			`)}
			<td>
				<button onclick="addRow('${currentDbName}', '${currentTableName}')" class="small">Add</button>
			</td>
		</tfoot>
	</table>
	`;
};
// 5.6.1 Create Input Element From Datatype
const createInputElFromDataType = (dataType) => {
    const inputEl = document.createElement('input');
    inputEl.classList.add('small');
    if (dataType == 'Binary') {
        inputEl.type = 'text';
        inputEl.addEventListener('input', () => {
            const { value } = inputEl;
            // Make sure the value only contains 0's and 1's
            if (value.replace(/(0|1)/g, '') == '') {
                inputEl.classList.remove('red');
            }
            else {
                inputEl.classList.add('red');
            }
        });
    }
    else if (dataType == 'Bit') {
        inputEl.type = 'text';
        inputEl.addEventListener('input', () => {
            const { value } = inputEl;
            // Make sure the value is either 0 or 1
            if (value == '0' || value == '1') {
                inputEl.classList.remove('red');
            }
            else {
                inputEl.classList.add('red');
            }
        });
    }
    else if (dataType == 'Boolean') {
        inputEl.type = 'checkbox';
    }
    else if (dataType == 'Char') {
        inputEl.type = 'text';
        inputEl.addEventListener('input', () => {
            const { value } = inputEl;
            // Make sure the string length is 1
            if (value.length != 1) {
                inputEl.classList.remove('red');
            }
            else {
                inputEl.classList.add('red');
            }
        });
    }
    else if (dataType == 'DateTime') {
        inputEl.type = 'datetime-local';
    }
    else if (dataType == 'Float') {
        inputEl.type = 'number';
        inputEl.step = 'any';
    }
    else if (dataType == 'Hex') {
        inputEl.type = 'text';
        inputEl.addEventListener('input', () => {
            const { value } = inputEl;
            // Make sure only the hexadecimal numbers are present
            if (value.toLowerCase().replace(/([0-9]|[a-f])/g, '') == '') {
                inputEl.classList.remove('red');
            }
            else {
                inputEl.classList.add('red');
            }
        });
    }
    else if (dataType == 'Int') {
        inputEl.type = 'number';
        inputEl.step = '1';
    }
    else if (dataType == 'JSON') {
        inputEl.type = 'text';
    }
    else if (dataType == 'String') {
        inputEl.type = 'text';
    }
    else {
        throw new Error(`Datatype '${dataType}' not handled`);
    }
    return inputEl;
};
// 5.6.2 Parse Input Value
const parseInputValue = (input, dataType) => {
    const { value, checked } = input;
    // Handle bad data
    if (input.classList.contains('red')) {
        throw new Error(`Input of '${value}' could not be parsed to datatype '${dataType}'`);
    }
    if (value == '') {
        return null;
    }
    if (dataType == 'Binary') {
        return value;
    }
    else if (dataType == 'Bit') {
        return parseInt(value);
    }
    else if (dataType == 'Boolean') {
        return checked;
    }
    else if (dataType == 'Char') {
        return value;
    }
    else if (dataType == 'DateTime') {
        return new Date(value);
    }
    else if (dataType == 'Float') {
        return parseFloat(value);
    }
    else if (dataType == 'Hex') {
        return value;
    }
    else if (dataType == 'Int') {
        return parseInt(value);
    }
    else if (dataType == 'JSON') {
        return value;
    }
    else if (dataType == 'String') {
        return value;
    }
    else {
        throw new Error(`Datatype '${dataType}' not handled`);
    }
};
// 5.6.3 Edit Row
const editRow = (dbName, tableName, rowNum) => {
    const rowEl = $(`tr[data-row-num="${rowNum}"]`);
    // Change button text to 'Save'
    const button = rowEl.querySelector('button.edit');
    const savedOnclick = button.onclick;
    button.onclick = null;
    button.innerText = 'Save';
    // Change all fields to inputs
    const fields = rowEl.querySelectorAll('.col');
    fields.forEach(cell => {
        // Get data from cell
        const data = cell.innerText;
        // Clear the text
        cell.innerHTML = '';
        // Get datatype
        const dataType = cell.getAttribute('data-datatype');
        // Add the input
        const input = createInputElFromDataType(dataType);
        cell.appendChild(input);
        input.value = data;
    });
    // Listen for the Save button click
    button.onclick = async () => {
        // Gather inputs
        const row = {};
        fields.forEach(cell => {
            const colName = cell.getAttribute('data-col-name');
            const dataType = cell.getAttribute('data-datatype');
            const input = cell.querySelector('input');
            // Store the input value
            const value = parseInputValue(input, dataType);
            row[colName] = value;
        });
        // Remove the inputs and add the plain data back in the cells
        fields.forEach(cell => {
            const colName = cell.getAttribute('data-col-name');
            const input = cell.querySelector('input');
            // Remove the input
            input.remove();
            // Add the plain data back in the cell
            cell.innerText = row[colName].toString();
        });
        // Update the value in the database
        await updateRow(dbName, tableName, rowNum, row);
        // Todo: Show loader
        // Reset button text to edit
        button.innerText = 'Edit';
        button.onclick = savedOnclick;
    };
};
// 5.6.4 Update Row
const updateRow = async (dbName, tableName, rowNum, newRow) => {
    const suToken = await getSuToken();
    try {
        await request('/admin-panel/workers/database/table/update-row.node.js', {
            suToken, dbName, tableName, rowNum, newRow
        });
    }
    catch (err) {
        handleRequestError(err);
    }
};
// 5.6.5 Delete Row
const deleteRow = async (dbName, tableName, rowNum) => {
    const suToken = await getSuToken();
    try {
        const rowEl = $(`tr[data-row-num="${rowNum}"]`);
        // Todo: show loader
        await request('/admin-panel/workers/database/table/delete-row.node.js', {
            suToken, dbName, tableName, rowNum
        });
        // Refetch the table
        currentTable = await getTable(dbName, tableName);
        // Remove the row visually
        rowEl.remove();
    }
    catch (err) {
        handleRequestError(err);
    }
};
// 5.6.6 Add Row
const addRow = async (dbName, tableName) => {
    // Get the new row
    const newRow = {};
    const fields = $a('tfoot .col');
    for (let cell of fields) {
        const colName = cell.getAttribute('data-col-name');
        const dataType = cell.getAttribute('data-datatype');
        const input = cell.querySelector('input');
        // Store the input value
        const value = parseInputValue(input, dataType);
        newRow[colName] = value;
    }
    // Query
    try {
        const suToken = await getSuToken();
        await request('/admin-panel/workers/database/table/insert-row.node.js', {
            suToken, dbName, tableName, newRow
        });
        // Refetch the table
        currentTable = await getTable(dbName, tableName);
        const { rows, cols } = currentTable;
        const row = rows[rows.length - 1];
        // Todo: What if the new row doesn't go through the current filters?
        // Add the row visually
        $('tbody').insertAdjacentHTML('beforeend', /* html */ `
		<tr data-row-num="${row.rowNum}">
			${reduceArray(cols, col => /* html */ `
			<td data-datatype="${col.dataType}" data-col-name="${col.name}" class="col">${row[col.name]}</td>
			`)}
			<td class="col-options">
				<button onclick="editRow('${currentDbName}', '${currentTableName}', ${row.rowNum})" class="small edit">Edit</button>
				<button onclick="deleteRow('${currentDbName}', '${currentTableName}', ${row.rowNum})" class="small red">Delete</button>
			</td>
		</tr>
		`);
    }
    catch (err) {
        handleRequestError(err);
    }
};
// 5.6.7 Table Ordering
const toggleOrderTable = async (orderArrow, colName) => {
    /*

        Visuals

    */
    const prevDirection = orderArrow.getAttribute('data-direction');
    let direction;
    // Get new direction
    if (prevDirection == 'unset') {
        direction = 'down';
    }
    else if (prevDirection == 'down') {
        direction = 'up';
    }
    else {
        direction = 'unset';
    }
    // Set new direction
    orderArrow.setAttribute('data-direction', direction);
    orderArrow.title = captitalise(direction);
    // Set right image and style
    if (direction == 'up') {
        orderArrow.src = '/admin-panel/img/arrow-up.png';
    }
    else if (direction == 'down') {
        orderArrow.src = '/admin-panel/img/arrow-down.png';
    }
    else {
        orderArrow.src = '/admin-panel/img/arrow-down-faded.png';
    }
    if (direction == 'unset') {
        orderArrow.classList.add('hidden');
    }
    else {
        orderArrow.classList.remove('hidden');
    }
    /*

        Actual ordering

    */
    if (direction == 'unset') {
        currentOrderBy.delete(colName);
    }
    else {
        currentOrderBy.set(colName, (direction == 'down') ? 'ASC' : 'DESC');
    }
    await orderCurrentTable();
    updateTable();
    setOrderArrowsOfTable();
};
const orderCurrentTable = async () => {
    // Generate orderBy array
    const orderArr = [];
    for (let [colName, ordering] of currentOrderBy) {
        orderArr.push([colName, ordering]);
    }
    // Send request
    currentTable = await getTable(currentDbName, currentTableName, orderArr);
};
const setOrderArrowsOfTable = () => {
    for (let [colName, ordering] of currentOrderBy) {
        // Get element
        const orderArrow = $(`[data-col-name="${colName}"] img.order-direction`);
        // Set new direction
        const direction = (ordering == 'ASC') ? 'down' : 'up';
        orderArrow.setAttribute('data-direction', direction);
        orderArrow.title = captitalise(direction);
        // Set right image and style
        if (direction == 'up') {
            orderArrow.src = '/admin-panel/img/arrow-up.png';
        }
        else {
            orderArrow.src = '/admin-panel/img/arrow-down.png';
        }
        orderArrow.classList.remove('hidden');
    }
};
// Get the current table with the current filters applied
const getFilteredCurrentTable = () => {
    let table = currentTable;
    // Apply the current custom filter
    const customFilterFunction = customFiltersToFilterFunction();
    if (customFilterFunction != null) {
        table = filterTable(table, customFilterFunction);
    }
    // Apply each filter from currentFilters
    for (let [_filterName, filterFunction] of currentFilters) {
        table = filterTable(table, filterFunction);
    }
    return table;
};
// Filter a TableRepresentation with a FilterFunction
const filterTable = (table, filter) => {
    const rowsOut = [];
    for (let row of table.rows) {
        if (filter(row)) {
            rowsOut.push(row);
        }
    }
    return {
        ...table,
        rows: rowsOut
    };
};
// Enable or disable a built-in filter
const setTableFilter = (builtInFilterName, enabled) => {
    if (enabled) {
        const filterFunction = currentBuiltInFilters.get(builtInFilterName);
        currentFilters.set(builtInFilterName, filterFunction);
    }
    else {
        currentFilters.delete(builtInFilterName);
    }
    // Refresh table
    updateTable();
};
// Map to convert user-friendly operators to JS operators
const operatorMap = new Map([
    ['Equals', '=='],
    ['Is bigger than', '>'],
    ['Is bigger than or equal to', '>='],
    ['Is smaller than', '<'],
    ['Is smaller than or equal to', '<='],
]);
// Surround input values with quotes if needed
const parseFilterInputValue = (value, colName) => {
    const { cols } = currentTable;
    let dataType;
    for (let col of cols) {
        if (col.name == colName) {
            dataType = col.dataType;
            break;
        }
    }
    if (dataType == undefined) {
        throw new Error(`Could not find column "${colName}" in the current table`);
    }
    if (['Bit', 'Boolean', 'Float', 'Int'].includes(dataType)) {
        return value;
    }
    else {
        return `"${value}"`;
    }
};
// Show the custom filter popup and handle the result
const setCustomFilters = async () => {
    const { cols } = currentTable;
    const generateInputHTML = (button) => /* html */ `
	<div class="input">

		<div class="search no-input-filter overflow column">
			<input type="text" placeholder="Select column..." style="width: 150px">
			<div class="arrow"></div>
			<ul class="dropdown">
				${reduceArray(cols, col => /* html */ `
				<li>${col.name}</li>
				`)}
			</ul>
		</div>

		<div class="search no-input-filter overflow operator">
			<input type="text" placeholder="Select operator...">
			<div class="arrow"></div>
			<ul class="dropdown">
				${reduceMap(operatorMap, userFriendlyOperator => /* html */ `
				<li>${userFriendlyOperator}</li>
				`)}
			</ul>
		</div>

		<input class="value dark" type="text" style="width: 150px" placeholder="Value">

		${(button == 'clear') ? /* html */ `
		<button class="red" onclick="clearFilter(this)">Clear filter</button>
		` : /* html */ `
		<button class="red" onclick="deleteFilter(this)">Delete filter</button>
		`}

	</div>
	`;
    const popupId = randomString(10);
    document.body.insertAdjacentHTML('beforeend', /* html */ `
	<div class="popup" data-id="${popupId}">
		<a class="popup-close-button" onclick="removePopup()">✕</a>
		<h1 class="popup-title">Set Filters</h1>

		<div class="inputs">
			${generateInputHTML('clear')}
		</div>

		<br>
		<button class="plus add-filter" onclick="addFilter(this)">Add a filter</button>
		<br><br>
		<button class="small" onclick="setFilters(this)">Set</button>
	</div>
	`);
    window.addFilter = (buttonEl) => {
        const inputContainer = buttonEl.parentElement.$('.inputs');
        inputContainer.insertAdjacentHTML('beforeend', generateInputHTML('delete'));
        initSearchBoxes();
    };
    window.deleteFilter = (buttonEl) => {
        const inputs = buttonEl.parentElement;
        inputs.remove();
    };
    window.clearFilter = (buttonEl) => {
        const inputContainer = buttonEl.parentElement;
        const inputs = inputContainer.$a('input');
        for (let input of inputs) {
            input.value = '';
        }
    };
    window.removePopup = () => {
        popupEl.classList.add('closed');
        setTimeout(() => {
            popupEl.remove();
        }, 300);
    };
    const popupEl = $(`.popup[data-id="${popupId}"]`);
    // Show existing filters
    for (let i = 0; i < currentCustomFilters.length; i++) {
        const filter = currentCustomFilters[i];
        const inputRows = popupEl.$a('.inputs .input');
        const lastInputRow = inputRows[inputRows.length - 1];
        // Set values
        const colInput = lastInputRow.$('.column input');
        const operatorInput = lastInputRow.$('.operator input');
        const valueInput = lastInputRow.$('input.value');
        colInput.value = filter.colName;
        operatorInput.value = filter.operator;
        valueInput.value = filter.value;
        // Remove double quotes from stringed values
        if (filter.value.startsWith('"')) {
            valueInput.value = filter.value.substring(1, filter.value.length - 1);
        }
        // Create new input row
        if (i != currentCustomFilters.length - 1) {
            window.addFilter(popupEl.$('.add-filter'));
        }
    }
    initSearchBoxes();
    window.setFilters = (buttonEl) => {
        // Get all inputs
        const inputs = buttonEl.parentElement.$a('.inputs .input');
        // Reset current custom filters
        currentCustomFilters = [];
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            // Get and parse input values
            const colName = input.$('.column input').value;
            // Skip if colName is empty
            if (colName == '') {
                continue;
            }
            const operator = input.$('.operator input').value;
            const value = parseFilterInputValue(input.$('input.value').value, colName);
            // Push the filter to the current custom filters
            currentCustomFilters.push({
                colName, operator, value
            });
        }
        // Remove the popup from the screen
        popupEl.classList.add('closed');
        setTimeout(() => {
            popupEl.remove();
        }, 300);
        // Update the table
        updateTable();
    };
};
const customFiltersToFilterFunction = () => {
    if (currentCustomFilters.length == 0) {
        return null;
    }
    let filterFunctionString = 'row => ';
    let amountOfFilters = 0;
    for (let i = 0; i < currentCustomFilters.length; i++) {
        const filter = currentCustomFilters[i];
        const { colName, value } = filter;
        const operator = operatorMap.get(filter.operator);
        if (colName == '' || value == '' || operator == undefined) {
            continue;
        }
        amountOfFilters++;
        const suffix = (i != currentCustomFilters.length - 1) ? ' && ' : ';';
        filterFunctionString += `row.${colName} ${operator} ${value}${suffix}`;
    }
    if (amountOfFilters == 0) {
        return null;
    }
    return eval(filterFunctionString);
};
// 5.6.9 Download Table to CSV
const toCSVValue = (value, dataType) => {
    if (['Binary', 'Hex', 'DateTime', 'String', 'Char', 'JSON'].includes(dataType)) {
        return `"${value}"`;
    }
    else if (['Int', 'Float', 'Bit'].includes(dataType)) {
        return value.toString();
    }
    else if (['Boolean'].includes(dataType)) {
        return value ? '"true"' : '"false"';
    }
    else {
        throw new Error(`Datatype '${dataType}' not handled`);
    }
};
const currentTableToCSV = () => {
    const table = getFilteredCurrentTable();
    const { rows, cols } = table;
    let csv = '';
    // Add columns
    for (let i = 0; i < cols.length; i++) {
        const delimiter = (i == cols.length - 1) ? '\n' : ',';
        const col = cols[i];
        csv += col.name + delimiter;
    }
    // Add rows
    for (let row of rows) {
        for (let i = 0; i < cols.length; i++) {
            const delimiter = (i == cols.length - 1) ? '\n' : ',';
            const col = cols[i];
            const value = toCSVValue(row[col.name], col.dataType);
            csv += value + delimiter;
        }
    }
    return csv;
};
const downloadTableToCSV = () => {
    const csv = currentTableToCSV();
    // Create a File from the csv string
    const file = new File([csv], `csv-download.csv`, { type: 'text/csv' });
    // Create fake download button
    const downloadButton = document.createElement('a');
    downloadButton.href = URL.createObjectURL(file);
    downloadButton.download = 'csv-download.csv';
    // Add the fake download button to the page
    document.body.appendChild(downloadButton);
    // Click the fake download button
    downloadButton.click();
    // Remove the fake download button from the page
    downloadButton.remove();
};
/*
    6.1 Fetch Users
*/
const fetchUsers = async () => {
    const suToken = await getSuToken();
    const result = await request('/admin-panel/workers/user-management/get-users.node.js', {
        suToken
    });
    return JSON.parse(result);
};
/*
    6.2 Show User Management Panel
*/
const showUserManagement = async () => {
    showLoader();
    const users = await fetchUsers();
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
			${reduceArray(users, user => /* html */ `
				<tr>
					<td class="col-id">${user.id}</td>
					<td class="col-name">${user.name}</td>
					<td class="col-options">
						<button class="small" onclick="changePassword(${user.id}, '${user.name}')">Change Password</button>
						<button class="small red" onclick="deleteUser(${user.id}, '${user.name}')">Delete</button>
					</td>
				</tr>
				`)}
			</tbody>
		</table>
	</div>
	<br>
	<button class="small" onclick="addUser()">Add User</button>
	`;
    setSearchParams({
        tab: 'user-management'
    });
};
/*
    6.3 Change User's Password
*/
const changePassword = async (userID, userName) => {
    const suToken = await getSuToken();
    const popupRes = await popup('Changing Password', `Enter a new password for user ${userName}`, [
        {
            name: 'Enter'
        }
    ], [
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
    ]);
    const oldPassword = popupRes.inputs.get('old-password');
    const newPassword = popupRes.inputs.get('password');
    const confirmedPassword = popupRes.inputs.get('confirmed-password');
    if (newPassword == confirmedPassword) {
        try {
            await request('/admin-panel/workers/user-management/change-user-password.node.js', {
                suToken, userID, oldPassword, newPassword
            });
        }
        catch (err) {
            handleRequestError(err);
        }
    }
    else {
        notification('Error', 'The passwords you entered did not match. Please try again.');
    }
};
/*
    6.4 Delete User
*/
const deleteUser = async (userID, userName) => {
    const suToken = await getSuToken();
    const popupRes = await popup('Deleting User', `Are you sure you want to delete user ${userName}?`, [
        {
            name: 'Delete User',
            classes: ['red']
        },
        {
            name: 'Cancel'
        }
    ]);
    if (popupRes.buttonName == 'Delete User') {
        try {
            await request('/admin-panel/workers/user-management/delete-user.node.js', {
                suToken, userID
            });
            showUserManagement();
        }
        catch (err) {
            handleRequestError(err);
        }
    }
};
/*
    6.5 Add User
*/
const addUser = async () => {
    const suToken = await getSuToken();
    const popupRes = await popup('Adding User', 'Please fill out the details of the new user.', [
        {
            name: 'Add User'
        }
    ], [
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
    ]);
    const username = popupRes.inputs.get('username');
    const password = popupRes.inputs.get('password');
    const confirmedPassword = popupRes.inputs.get('confirmed-password');
    if (password == confirmedPassword) {
        try {
            await request('/admin-panel/workers/user-management/add-user.node.js', {
                suToken, username, password
            });
            showUserManagement();
        }
        catch (err) {
            handleRequestError(err);
        }
    }
    else {
        notification('Error', 'The passwords you entered did not match. Please try again.');
    }
};
