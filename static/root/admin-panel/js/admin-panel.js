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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var _this = this;
/* ===================
    1. On-load setup
=================== */
window.onload = function () {
    var username = Cookies.get('username');
    if (username == undefined) {
        // Go to login page
        document.location.pathname = '/admin-panel/login.html';
    }
    else {
        // Set the greeting
        var greetingLI = $('#greeting');
        greetingLI.innerText = "Welcome, " + Cookies.get('username') + "!";
    }
    goToTheRightPage();
};
var initTinyMCE = function () {
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
var db;
/*

    2.2 Common Functions

*/
var fetchPages = function () {
    return new Promise(function (resolve, reject) {
        request('/admin-panel/workers/get-pages.node.js', {
            token: Cookies.get('token')
        })
            .then(function (res) {
            db = res.body;
            resolve();
        })
            .catch(function (res) {
            reject(res);
        });
    });
};
var pageHistory = new Stack();
pageHistory.push(window.location.origin + '/admin-panel/');
var setSearchParams = function (params) {
    var newSearchQuery = '?';
    for (var paramName in params) {
        var paramValue = params[paramName];
        newSearchQuery += paramName + "=" + paramValue.toString() + "&";
    }
    // Remove trailing ampersand
    newSearchQuery = newSearchQuery.substring(0, newSearchQuery.length - 1);
    var newURL = window.location.origin + window.location.pathname + newSearchQuery;
    // Set the URL of the page without reloading it
    window.history.pushState({ path: newURL }, '', newURL);
    // Save new URL in pageHistory
    pageHistory.push(window.location.href);
};
var goBackInHistory = function () {
    if (pageHistory.size > 1) {
        pageHistory.pop();
    }
    if (pageHistory.size > 0) {
        var prevUrl = pageHistory.pop();
        // Set the URL of the page without reloading it
        window.history.pushState({ path: prevUrl }, '', prevUrl);
        goToTheRightPage();
    }
};
var goToTheRightPage = function () {
    var searchParams = new URLSearchParams(document.location.search);
    var tab = searchParams.get('tab');
    if (tab == null) {
        goToHomepage();
    }
    else {
        if (tab == 'pages') {
            showPages();
        }
        else if (tab == 'edit-page') {
            var pageId = parseInt(searchParams.get('page-id'));
            if (pageId == null) {
                showPages();
            }
            else {
                editPage(pageId);
            }
        }
        else if (tab == 'delete-page') {
            var pageId = parseInt(searchParams.get('page-id'));
            if (pageId == null) {
                showPages();
            }
            else {
                deletePage(pageId);
            }
        }
        else if (tab == 'add-page') {
            var pageType = searchParams.get('page-type');
            if (pageType == null) {
                showPages();
            }
            else {
                addPage(pageType);
            }
        }
        else if (tab == 'file-manager') {
            var path = searchParams.get('path');
            showFiles(path);
        }
    }
};
var goToHomepage = function () {
    // Todo: make homepage
    $('.main').innerHTML = /* html */ "\n\t\t\n\t";
};
var reduceArray = function (arr, f) {
    var output = '';
    for (var i = 0; i < arr.length; i++) {
        output += f(arr[i], i);
    }
    return output;
};
var reduceObject = function (obj, f) {
    var output = '';
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            output += f(i);
        }
    }
    return output;
};
var showLoader = function () {
    $('.main').innerHTML = /* html */ "\n\t\t<div class=\"loader\"></div>\n\t";
};
/* ===================
    3. Page Manager
=================== */
/*

    3.1 Show Pages

*/
var showPages = function () {
    showLoader();
    fetchPages()
        .then(function () {
        var pages = db.pages, pageTypes = db.pageTypes;
        $('.main').innerHTML = /* html */ "\n\t\t\t\t<ul class=\"pages\">\n\t\t\t\t\t" + reduceArray(pageTypes, function (pageType) {
            var pagesOfCurrentType = pages.filter(function (page) { return page.pageType == pageType.name; });
            return /* html */ "\n\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t<h1>" + captitalise(pageType.name) + ":</h1>\n\t\t\t\t\t\t\t\t<table class=\"pages\">\n\t\t\t\t\t\t\t\t\t<thead>\n\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t<td>Page Title:</td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t</thead>\n\t\t\t\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t\t\t\t" + (reduceArray(pagesOfCurrentType, function (page, i) { /* html */ return "\n\t\t\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td><span>" + page.pageContent.title + "</span></td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small\" onclick=\"editPage(" + page.id + ")\">Edit</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + ((pageType.canAdd) ? /* html */ "\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small red\" onclick=\"deletePage(" + page.id + ")\">Delete</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" : '') + "\n\t\t\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + ((i != 0) ? /* html */ "\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img class=\"clickable-icon\" src=\"/admin-panel/img/arrow-up.png\" alt=\"up\" title=\"move up\" style=\"margin-right: .5em\" onclick=\"movePage('UP', '" + pageType.name + "', " + i + ")\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" : '') + "\n\t\t\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" + ((i != pagesOfCurrentType.length - 1) ? /* html */ "\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img class=\"clickable-icon\" src=\"/admin-panel/img/arrow-down.png\" alt=\"down\" title=\"move down\" onclick=\"movePage('DOWN', '" + pageType.name + "', " + i + ")\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t" : '') + "\n\t\t\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t\t\t"; })
                +
                    (function () { return (pageType.canAdd) ? /* html */ "\n\t\t\t\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small\" onclick=\"addPage('" + pageType.name + "')\">Add page</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t\t\t" : ''; })()) + "\n\t\t\t\t\t\t\t\t\t</tbody>\n\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t";
        }) + "\n\t\t\t\t</ul>\n\t\t\t";
        window.movePage = function (direction, pageTypeName, index) { return __awaiter(_this, void 0, void 0, function () {
            var pagesOfCurrentType, page1, page2, suToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pagesOfCurrentType = pages.filter(function (_page) { return _page.pageType == pageTypeName; });
                        page1 = pagesOfCurrentType[index];
                        page2 = (direction == 'UP')
                            ? pagesOfCurrentType[index - 1]
                            : pagesOfCurrentType[index + 1];
                        return [4 /*yield*/, getSuToken()];
                    case 1:
                        suToken = _a.sent();
                        if (suToken == undefined) {
                            // User cancelled
                            throw new Error("User cancelled");
                        }
                        return [4 /*yield*/, request('/admin-panel/workers/swap-pages.node.js', {
                                suToken: suToken, page1: page1, page2: page2
                            })
                                .catch(handleRequestError)];
                    case 2:
                        _a.sent();
                        showPages();
                        return [2 /*return*/];
                }
            });
        }); };
        setSearchParams({
            tab: 'pages'
        });
    })
        .catch(function (res) {
        if (res.status == 403) {
            document.location.pathname = '/admin-panel/login.html';
        }
        else {
            // This should never happen
            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
        }
    });
};
/*

    3.2 Edit Page

*/
var editPage = function (id) {
    showLoader();
    fetchPages()
        .then(function () {
        var page = db.pages.find(function (el) { return el.id == id; });
        var template = db.pageTypes.find(function (el) { return el.name == page.pageType; }).template;
        $('.main').innerHTML = /* html */ "\n\t\t\t\t<h1>Editing page \"" + page.pageContent.title + "\"</h1>\n\t\t\n\t\t\t\t" + reduceObject(template, function (input) { /* html */ return "\n\t\t\t\t\t\t<br/><br/>\n\t\t\t\t\t\t<h2>" + input + ":</h2>\n\t\t\t\t\t\t" + pageTemplateInputToHTML(template[input], input, page.pageContent[input]) + "\n\t\t\t\t\t"; }) + "\n\t\t\n\t\t\t\t<br/><br/>\n\t\t\t\t<button id=\"submit-changes\" onclick=\"handleSubmit()\">Save Page</button>\n\t\t\t";
        // 3.2.1 Save Page
        var savePage = function (pageContent, pageId) { return __awaiter(_this, void 0, void 0, function () {
            var suToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getSuToken()];
                    case 1:
                        suToken = _a.sent();
                        if (suToken == undefined) {
                            // User cancelled
                            throw new Error("User cancelled");
                        }
                        return [4 /*yield*/, request('/admin-panel/workers/update-page.node.js', {
                                suToken: suToken, pageContent: pageContent, pageId: pageId
                            })
                                .catch(function (err) {
                                handleRequestError(err);
                                throw err;
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        window.handleSubmit = function (keepEditing) {
            if (keepEditing === void 0) { keepEditing = false; }
            var pageContent = collectInputs(template);
            savePage(pageContent, page.id)
                .then(function () {
                notification('Saved page', "Successfully saved page \"" + page.pageContent.title + "\"!");
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
    })
        .catch(function (res) {
        if (res.status == 403) {
            document.location.pathname = '/admin-panel/login.html';
        }
        else {
            // This should never happen
            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
        }
    });
};
/*

    3.3 Add Page

*/
var addPage = function (pageType) {
    showLoader();
    fetchPages()
        .then(function () {
        var template = db.pageTypes.find(function (el) { return el.name == pageType; }).template;
        $('.main').innerHTML = /* html */ "\n\t\t\t\t<h1>Creating new page of type \"" + pageType + "\"</h1>\n\t\t\n\t\t\t\t" + reduceObject(template, function (input) { /* html */ return "\n\t\t\t\t\t\t<br/><br/>\n\t\t\t\t\t\t<h2>" + input + ":</h2>\n\t\t\t\t\t\t" + pageTemplateInputToHTML(template[input], input, '') + "\n\t\t\t\t\t"; }) + "\n\t\t\n\t\t\t\t<br/><br/>\n\t\t\t\t<button id=\"add-page\" onclick=\"handleSubmit('" + pageType + "')\">Add Page</button>\n\t\t\t";
        window.handleSubmit = function () {
            var pageContent = collectInputs(template);
            getSuToken()
                .then(function (suToken) {
                request('/admin-panel/workers/add-page.node.js', {
                    suToken: suToken, pageType: pageType, pageContent: pageContent
                })
                    .then(function () {
                    notification('Added page', "Successfully added page \"" + pageContent.title + "\"!");
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
    })
        .catch(function (res) {
        if (res.status == 403) {
            document.location.pathname = '/admin-panel/login.html';
        }
        else {
            // This should never happen
            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
        }
    });
};
/*

    3.4 Delete Page

*/
var deletePage = function (id) {
    showLoader();
    fetchPages()
        .then(function () {
        var page = db.pages.find(function (el) { return el.id == id; });
        $('.main').innerHTML = /* html */ "\n\t\t\t\t<h1>Deleting page \"" + page.pageContent.title + "\"</h1>\n\n\t\t\t\t<p>Are you sure you want to delete this page?</p>\n\n\t\t\t\t<br/><br/>\n\t\t\t\t<button id=\"delete-page\" onclick=\"handleSubmit()\">Delete Page</button>\n\t\t\t\t";
        window.handleSubmit = function () {
            getSuToken()
                .then(function (suToken) {
                request('/admin-panel/workers/delete-page.node.js', {
                    suToken: suToken,
                    pageId: page.id
                })
                    .then(function () {
                    notification('Deleted page', "Successfully deleted page \"" + page.pageContent.title + "\"!");
                    showPages();
                })
                    .catch(handleRequestError);
            });
        };
        setSearchParams({
            tab: 'delete-page',
            'page-id': id
        });
    })
        .catch(function (res) {
        if (res.status == 403) {
            document.location.pathname = '/admin-panel/login.html';
        }
        else {
            // This should never happen
            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
        }
    });
};
var pageTemplateInputToHTML = function (inputType, inputName, inputContent) {
    if (inputType == 'text') {
        // text
        return /* html */ "\n\t\t<textarea id=\"" + inputName + "\" data-input=\"" + inputName + "\">\n\t\t\t" + inputContent + "\n\t\t</textarea>\n\t\t";
    }
    else if (inputType == 'string') {
        // string
        return /* html */ "\n\t\t\t<input id=\"" + inputName + "\" data-input=\"" + inputName + "\" type=\"text\" value=\"" + inputContent + "\" />\n\t\t";
    }
    else if (inputType == 'img[]') {
        // img[]
        var imgs_1 = inputContent;
        return /* html */ "\n\t\t\t<div class=\"img-array\" id=\"" + inputName + "\" data-input=\"" + inputName + "\">\n\t\t\t\t" + reduceArray(imgs_1, function (img, i) {
            return generateImgArrayImg(img, (i != 0), (i != imgs_1.length - 1));
        }) + "\n\t\t\t\t<div class=\"img-array-plus\" onclick=\"addImg('" + inputName + "')\"></div>\n\t\t\t</div>\n\t\t";
    }
};
// 3.5.1 Generate .img-array-img Element
var generateImgArrayImg = function (imgSrc, hasLeftArrow, hasRightArrow) { /* html */ return "\n\t<div class=\"img-array-img\">\n\t\t<div class=\"img-array-img-options\">\n\t\t\t<button class=\"small light\" onclick=\"editImg(this)\">Edit</button>\n\t\t\t<button class=\"small light red\" onclick=\"deleteImg(this)\">Delete</button>\n\t\t</div>\n\t\t<div class=\"img-array-img-arrows\">\n\t\t\t" + ((hasLeftArrow) ? /* html */ "\n\t\t\t\t<img class=\"arrow-left\" src=\"/admin-panel/img/arrow-left.png\" alt=\"arrow-left\" onclick=\"moveImg('left', this)\">\n\t\t\t" : '') + "\n\t\t\t" + ((hasRightArrow) ? /* html */ "\n\t\t\t\t<img class=\"arrow-right\" src=\"/admin-panel/img/arrow-right.png\" alt=\"arrow-right\" onclick=\"moveImg('right', this)\">\n\t\t\t" : '') + "\n\t\t</div>\n\t\t<img class=\"img\" data-path=\"" + imgSrc + "\" src=\"" + imgSrc + "\">\n\t</div>\n"; };
/*

    3.6 Collect Page Template Inputs

*/
var collectInputs = function (template) {
    // Get all input elements
    var elements = document.querySelectorAll('[data-input]');
    var pageContent = {};
    // Parse inputs
    for (var i = 0; i < elements.length; i++) {
        var inputKey = elements[i].getAttribute('data-input');
        var inputType = template[inputKey];
        var inputValue = void 0;
        if (inputType == 'text') {
            inputValue = tinyMCE.get(inputKey).getContent();
        }
        else if (inputType == 'string') {
            inputValue = elements[i].value.trim();
        }
        else if (inputType == 'img[]') {
            inputValue = [];
            var imgs = elements[i].querySelectorAll('.img');
            for (var j = 0; j < imgs.length; j++) {
                inputValue[j] = imgs[j].getAttribute('data-path');
            }
        }
        pageContent[inputKey] = inputValue;
    }
    return pageContent;
};
/*

    3.7 img[] Functions

*/
// 3.7.1 Move Image
var moveImg = function (direction, arrowEl) { return __awaiter(_this, void 0, void 0, function () {
    var imgArrayImgEl, imgEl1, imgEl2;
    return __generator(this, function (_a) {
        imgArrayImgEl = arrowEl.parentElement.parentElement;
        imgEl1 = imgArrayImgEl.querySelector('.img');
        imgEl2 = (direction == 'left')
            ? imgArrayImgEl.previousElementSibling.querySelector('.img')
            : imgArrayImgEl.nextElementSibling.querySelector('.img');
        // Swap the images
        imgEl2.parentElement.appendChild(imgEl1);
        imgArrayImgEl.appendChild(imgEl2);
        return [2 /*return*/];
    });
}); };
// 3.7.2 Edit Image
var editImg = function (buttonEl) { return __awaiter(_this, void 0, void 0, function () {
    var newImgPath, imgEl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, filePicker({
                    type: 'file',
                    title: 'Edit image',
                    body: 'Select a new image',
                    buttonText: 'Select',
                    extensions: imageExtensions
                }, false)
                    .catch(function () {
                    throw new Error("User cancelled");
                })
                // Update the old image
                // Todo: show loader while image is loading
            ];
            case 1:
                newImgPath = _a.sent();
                imgEl = buttonEl.parentElement.parentElement.querySelector('.img');
                imgEl.setAttribute('data-path', "/content" + newImgPath);
                imgEl.src = "/content" + newImgPath;
                return [2 /*return*/];
        }
    });
}); };
// 3.7.3 Delete Image
var deleteImg = function (buttonEl) { return __awaiter(_this, void 0, void 0, function () {
    var imgArrayImgEl, leftImgEl, rightImgEl;
    return __generator(this, function (_a) {
        imgArrayImgEl = buttonEl.parentElement.parentElement;
        leftImgEl = imgArrayImgEl.previousElementSibling;
        rightImgEl = imgArrayImgEl.nextElementSibling;
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
        return [2 /*return*/];
    });
}); };
// 3.7.4 Add Image
var addImg = function (inputName) { return __awaiter(_this, void 0, void 0, function () {
    var newImgPath, imgArrayPlus, prevImgArrayImg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, filePicker({
                    type: 'file',
                    title: 'Add image',
                    body: 'Select a new image',
                    buttonText: 'Select',
                    extensions: imageExtensions
                }, false)
                    .catch(function () {
                    throw new Error("User cancelled");
                })
                // Get the .img-array-plus element
            ];
            case 1:
                newImgPath = _a.sent();
                imgArrayPlus = $("[data-input=\"" + inputName + "\"").querySelector('.img-array-plus');
                // Add the image before it
                imgArrayPlus.insertAdjacentHTML('beforebegin', generateImgArrayImg("/content" + newImgPath, (imgArrayPlus.previousElementSibling != null), false));
                prevImgArrayImg = imgArrayPlus.previousElementSibling.previousElementSibling;
                if (prevImgArrayImg != null) {
                    prevImgArrayImg.querySelector('.img-array-img-arrows').innerHTML += /* html */ "\n\t\t\t<img class=\"arrow-right\" src=\"/admin-panel/img/arrow-right.png\" alt=\"arrow-right\" onclick=\"moveImg('right', this)\">\n\t\t";
                }
                return [2 /*return*/];
        }
    });
}); };
/* ===================
    4. File Manager
=================== */
/*

    4.1 Upload Files

*/
var uploadFiles = function (fileList, path) {
    if (path === void 0) { path = '/'; }
    return new Promise(function (resolve) {
        getSuToken()
            .then(function (suToken) {
            var files = [];
            var body = {
                suToken: suToken,
                path: path
            };
            for (var i = 0; i < fileList.length; i++) {
                var file = fileList[i];
                // Add each file to the files array
                files.push(file);
            }
            // Send the request
            request('/admin-panel/workers/fileupload.node.js', body, files)
                .then(resolve)
                .catch(handleRequestError);
        });
    });
};
/*

    4.2 Drop Area

*/
var initDropArea = function (path) {
    if (path === void 0) { path = '/'; }
    return new Promise(function (resolve) {
        var dropArea = $('.drop-area');
        var hiddenUploadInput = document.createElement('input');
        hiddenUploadInput.type = 'file';
        hiddenUploadInput.multiple = true;
        hiddenUploadInput.style.visibility = 'hidden';
        hiddenUploadInput.onchange = function () {
            uploadFiles(hiddenUploadInput.files, path)
                .then(resolve);
        };
        dropArea.appendChild(hiddenUploadInput);
        var preventDefaults = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };
        var highlight = function () {
            dropArea.classList.add('highlighted');
        };
        var unhighlight = function () {
            dropArea.classList.remove('highlighted');
        };
        var drop = function (e) {
            var dataTransfer = e.dataTransfer;
            var files = dataTransfer.files;
            // Todo: upload folders https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
            uploadFiles(files, path)
                .then(resolve);
        };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (event) {
            dropArea.addEventListener(event, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(function (event) {
            dropArea.addEventListener(event, highlight, false);
        });
        ['dragleave', 'drop'].forEach(function (event) {
            dropArea.addEventListener(event, unhighlight, false);
        });
        dropArea.addEventListener('drop', drop, false);
    });
};
var filePicker = function (options, multiple) { return new Promise(function (resolveFilePicker, rejectFilePicker) {
    // Set defaults
    options = __assign({
        type: 'file',
        newFileName: 'new-file-name.txt',
        extensions: null
    }, options);
    // Create HTML Element
    var filePickerEl = document.createElement('div');
    filePickerEl.classList.add('popup');
    filePickerEl.innerHTML = /* html */ "\n\t\t<a class=\"popup-close-button\">\u2715</a>\n\t\t<h1 class=\"popup-title\">" + options.title + "</h1>\n\t\t" + ((options.body != undefined) ? /* html */ "\n\t\t\t\t<p class=\"popup-body\">" + options.body + "</p>\n\t\t\t" : '') + "\n\t\t<div class=\"file-list-container\">\n\t\t\t<ul class=\"file-list file-list-root\">\n\t\t\t\t<li class=\"file-list-item file-list-root\" onclick=\"selectLI(this)\" onmouseover=\"hoverLI(this)\" onmouseleave=\"hoverLI(this, false)\" data-path=\"/\">\n\t\t\t\t\t<img class=\"file-manager-file-icon\" src=\"/admin-panel/img/file-icons/dir.png\" alt=\"dir\" onerror=\"\n\t\t\t\t\t\tthis.src = '" + "/admin-panel/img/file-icons/unknown.png" + "'; this.onerror = null\n\t\t\t\t\t\">\n\t\t\t\t\t/\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t\t" + ((options.type == 'new-file') ? /* html */ "\n\t\t\t\t<p>Fill in the name of the file</p>\n\t\t\t\t<input type=\"text\" class=\"filepicker-new-file\" value=\"" + options.newFileName + "\" placeholder=\"Enter new file name...\">\n\t\t\t" : '') + "\n\t\t<br><br>\n\t\t<button class=\"small\">" + options.buttonText + "</button>\n\t";
    // 4.3.1 Create UL from files
    var createULFromFiles = function (path) { return new Promise(function (resolve) {
        getFiles(path)
            .then(function (files) {
            // Filter only directories if needed
            var e_1, _a;
            if (options.type == 'directory' || options.type == 'new-file') {
                files = files.filter(function (file) { return file.isDirectory; });
            }
            // Filter extensions if needed
            if (options.extensions != null) {
                files = files.filter(function (file) {
                    return options.extensions.has(getExtension(file.name)) || file.isDirectory;
                });
            }
            // Create file-list UL
            var fileListEl = document.createElement('ul');
            fileListEl.classList.add('file-list');
            try {
                // Add each file to the file-list UL
                for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                    var file = files_1_1.value;
                    var name_1 = file.name;
                    var extension = (file.isDirectory)
                        ? 'dir'
                        : name_1.slice(name_1.lastIndexOf('.') + 1);
                    // Create the child LI
                    fileListEl.innerHTML += /* html */ "\n\t\t\t\t\t\t<li class=\"file-list-item\" onclick=\"selectLI(this)\" onmouseover=\"hoverLI(this)\" onmouseleave=\"hoverLI(this, false)\" data-path=\"" + ((file.isDirectory) ? path + file.name + '/' : path + file.name) + "\">\n\t\t\t\t\t\t\t" + ((file.isDirectory) ? "<span class=\"plus-button\" data-expanded=\"false\" onclick=\"expandDirectory(this)\"></span>" : '') + "\n\t\t\t\t\t\t\t<img class=\"file-manager-file-icon\" src=\"/admin-panel/img/file-icons/" + extension + ".png\" alt=\"" + extension + "\" onerror=\"\n\t\t\t\t\t\t\t\tthis.src = '" + "/admin-panel/img/file-icons/unknown.png" + "'; this.onerror = null\n\t\t\t\t\t\t\t\">\n\t\t\t\t\t\t\t" + file.name + "\n\t\t\t\t\t\t</li>\n\t\t\t\t\t";
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // 4.3.1.1 li.file-list-item hover animation
            window.hoverLI = function (li, hover) {
                if (hover === void 0) { hover = true; }
                if (event.target != li)
                    return;
                if (hover) {
                    li.classList.add('hover');
                    var hoverChangeEvent = new CustomEvent('hoverchange', {
                        detail: {
                            target: li
                        }
                    });
                    dispatchEvent(hoverChangeEvent);
                    addEventListener('hoverchange', function (e) {
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
            window.selectLI = function (li) {
                if (event.target != li)
                    return;
                if (li.getAttribute('data-selected') == 'true') {
                    li.classList.remove('selected');
                    li.setAttribute('data-selected', 'false');
                }
                else {
                    li.classList.add('selected');
                    li.setAttribute('data-selected', 'true');
                    var hoverChangeEvent = new CustomEvent('selectionchange', {
                        detail: {
                            newlySelected: li
                        }
                    });
                    dispatchEvent(hoverChangeEvent);
                    addEventListener('selectionchange', function (e) {
                        if (e.detail.newlySelected != li && !multiple) {
                            li.classList.remove('selected');
                            li.setAttribute('data-selected', 'false');
                        }
                    });
                }
            };
            // 4.3.1.3 Expand directory
            window.expandDirectory = function (button) {
                var li = button.parentElement;
                var directoryPath = li.getAttribute('data-path');
                var expanded = button.getAttribute('data-expanded');
                if (expanded == 'true') {
                    li.querySelector('ul.file-list').remove();
                    button.setAttribute('data-expanded', 'false');
                    // Decrement the margin of all parents
                    var childElementCount = parseInt(getComputedStyle(li).getPropertyValue('--files-inside'));
                    var currentLi = li;
                    while (true) {
                        var filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'));
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
                        .then(function (ul) {
                        li.appendChild(ul);
                        // Increment the margin of all parents
                        var currentLi = li;
                        var childElementCount = ul.childElementCount;
                        while (true) {
                            var filesInside = parseInt(getComputedStyle(currentLi).getPropertyValue('--files-inside'));
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
    }); };
    // Append the File Picker UL to the popup
    createULFromFiles('/')
        .then(function (ul) {
        filePickerEl.querySelector('li.file-list-root').appendChild(ul);
        // Set --files-inside for li.file-list-root
        var rootLI = filePickerEl.querySelector('li.file-list-root');
        rootLI.style.setProperty('--files-inside', (ul.childElementCount).toString());
    });
    var removePopup = function () {
        filePickerEl.classList.add('closed');
        setTimeout(function () {
            filePickerEl.remove();
        }, 300);
    };
    // 4.3.2 Handle submit button click
    filePickerEl.querySelector('button').addEventListener('click', function () {
        removePopup();
        // Get all selected files
        var lis = filePickerEl.querySelectorAll('li.file-list-item');
        var filePaths = [];
        lis.forEach(function (li) {
            if (li.classList.contains('selected')) {
                var path = li.getAttribute('data-path');
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
    filePickerEl.querySelector('a.popup-close-button').addEventListener('click', function () {
        removePopup();
        rejectFilePicker();
    });
    var escapePressHandler = function (e) {
        if (e.key == 'Escape') {
            removePopup();
            removeEventListener('keyup', escapePressHandler);
        }
    };
    addEventListener('keyup', escapePressHandler);
}); };
/*

    4.4 Show Files

*/
var getFiles = function (path) {
    if (path === void 0) { path = '/'; }
    return new Promise(function (resolve, reject) {
        request('/admin-panel/workers/get-files.node.js', {
            path: path,
            token: Cookies.get('token')
        })
            .then(function (res) {
            var fileArray = res.body.files;
            resolve(fileArray);
        })
            .catch(function (res) {
            reject(res);
        });
    });
};
var upALevel = function (path) {
    if (path.length <= 1) {
        return path;
    }
    // Remove trailing slash
    path = path.substring(0, path.length - 1);
    var lastSlash = path.lastIndexOf('/');
    return path.substring(0, lastSlash + 1);
};
var openFile = function (path) {
    window.open("/content" + path);
};
var checkboxStatus = 'unchecked';
var checkedCheckboxes = 0;
var allCheckboxesChecked = function () {
    var checkboxes = $a('tbody .col-checkbox input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            return false;
        }
    }
    return true;
};
var checkAllCheckboxes = function (check) {
    if (check === void 0) { check = true; }
    var checkboxes = $a('tbody .col-checkbox input[type="checkbox"]');
    if (check) {
        checkboxStatus = 'checked';
    }
    else {
        checkboxStatus = 'unchecked';
    }
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked != check) {
            checkbox.checked = check;
            checkbox.onchange(new Event('change'));
        }
    });
};
var uncheckAllCheckboxes = function () { return checkAllCheckboxes(false); };
var toggleAllCheckboxes = function () {
    if (allCheckboxesChecked()) {
        uncheckAllCheckboxes();
    }
    else {
        checkAllCheckboxes();
    }
};
var showFiles = function (path) {
    if (path === void 0) { path = '/'; }
    showLoader();
    setSearchParams({
        tab: 'file-manager',
        path: path
    });
    getFiles(path)
        .then(function (files) {
        files.sort(function (file) { return file.isDirectory ? -1 : 1; });
        $('.main').innerHTML = /* html */ "\n\t\t\t\t<div class=\"drop-area\">\n\t\t\t\t\t<h1>Folder: " + path + "</h1>\n\n\t\t\t\t\t<button class=\"small\" onclick=\"showFiles(upALevel('" + path + "'))\">Up a level</button>\n\t\t\t\t\t<button class=\"small\" onclick=\"$('input[type=file]').click()\">Upload Files</button>\n\t\t\t\t\t<button class=\"small\" onclick=\"createNewDirectory('" + path + "')\">New Folder</button>\n\t\t\t\t\t<span class=\"bulk-actions hidden\">\n\t\t\t\t\t\tSelected Files:\n\t\t\t\t\t\t<button class=\"small\" onclick=\"bulkCopyFiles()\">Copy</button>\n\t\t\t\t\t\t<button class=\"small\" onclick=\"bulkMoveFiles()\">Move</button>\n\t\t\t\t\t\t<button class=\"small red\" onclick=\"bulkDeleteFiles()\">Delete</button>\n\t\t\t\t\t</span>\n\n\t\t\t\t\t<br><br>\n\n\t\t\t\t\t<table class=\"files\">\n\n\t\t\t\t\t\t<thead>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td class=\"col-checkbox\">\n\t\t\t\t\t\t\t\t\t<input type=\"checkbox\" onclick=\"toggleAllCheckboxes()\" title=\"Select all\">\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td class=\"col-icon\"></td>\n\t\t\t\t\t\t\t\t<td class=\"col-name\">Name</td>\n\t\t\t\t\t\t\t\t<td class=\"col-size\">Size</td>\n\t\t\t\t\t\t\t\t<td class=\"col-modified\">Modified</td>\n\t\t\t\t\t\t\t\t<td class=\"col-options\"></td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</thead>\n\n\t\t\t\t\t\t<tbody>\n\t\t\t\t\t\t\t" + reduceArray(files, function (file) {
            var name = file.name;
            var size = file.isDirectory ? '–' : parseSize(file.size);
            var modified = parseDate(file.modified);
            var extension = (file.isDirectory)
                ? 'dir'
                : name.slice(name.lastIndexOf('.') + 1);
            window.toggleDropdown = function (el, e) {
                var isDescendant = function (child, parent) {
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
                setTimeout(function () {
                    var handler = function (mouseEvent) {
                        if (!isDescendant(mouseEvent.target, el)) {
                            el.classList.remove('active');
                            document.removeEventListener('click', handler);
                        }
                    };
                    document.addEventListener('click', handler);
                }, 0);
            };
            var bulkFileActionsShown = false;
            var showBulkFileActions = function () {
                bulkFileActionsShown = true;
                $('span.bulk-actions').classList.remove('hidden');
            };
            var hideBulkFileActions = function () {
                bulkFileActionsShown = false;
                $('span.bulk-actions').classList.add('hidden');
            };
            window.handleFileCheckboxes = function (checkboxEl) {
                var selectAllCheckbox = $('thead .col-checkbox input[type="checkbox"]');
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
            var getSelectedFiles = function () {
                var tableRows = $a('tr.file-row');
                var selectedFiles = [];
                for (var i = 0; i < tableRows.length; i++) {
                    var checkboxEl = tableRows[i].querySelector('input[type="checkbox"]');
                    if (checkboxEl.checked) {
                        selectedFiles.push(files[i]);
                    }
                }
                return selectedFiles;
            };
            window.bulkDeleteFiles = function () {
                var selectedFiles = getSelectedFiles();
                popup('Deleting multiple files', "Are you sure you want to delete " + numifyNoun(selectedFiles.length, 'file', 'files') + "?\n\t\t\t\t\t\t\t\t\t\t\t<codeblock>" + reduceArray(selectedFiles, function (f) { return f.name + '<br>'; }) + "</codeblock>", [
                    {
                        name: 'Delete',
                        classes: ['red']
                    },
                    {
                        name: 'Cancel'
                    },
                ])
                    .then(function (popupRes) {
                    if (popupRes.buttonName == 'Delete') {
                        getSuToken()
                            .then(function (suToken) {
                            var filePaths = selectedFiles.map(function (f) { return path + f.name; });
                            request('/admin-panel/workers/delete-multiple-files.node.js', {
                                suToken: suToken,
                                filePaths: filePaths
                            })
                                .then(function () {
                                // Refresh files
                                showFiles(path);
                            })
                                .catch(handleRequestError);
                        });
                    }
                })
                    .catch(function () {
                    // User cancelled
                });
            };
            window.bulkCopyFiles = function () {
                var selectedFiles = getSelectedFiles();
                filePicker({
                    type: 'directory',
                    title: 'Copy files',
                    body: 'Select a folder to where you want to copy the files',
                    buttonText: 'Select folder'
                }, false)
                    .then(function (selectedFolder) {
                    getSuToken()
                        .then(function (suToken) {
                        request('/admin-panel/workers/copy-files.node.js', {
                            suToken: suToken,
                            sources: selectedFiles.map(function (selectedFile) { return selectedFile.path; }),
                            destination: selectedFolder
                        })
                            .then(function () {
                            notification('Copied Files', "Succesfully copied " + numifyNoun(selectedFiles.length, 'file', 'files') + " to <code>" + selectedFolder + "</code>");
                            // Refresh files
                            showFiles(path);
                        })
                            .catch(function (res) {
                            // This should never happen
                            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
                        });
                    });
                })
                    .catch(function () {
                    // User cancelled
                });
            };
            window.bulkMoveFiles = function () {
                var selectedFiles = getSelectedFiles();
                filePicker({
                    type: 'directory',
                    title: 'Move Files',
                    body: 'Select a folder to where you want to move the files',
                    buttonText: 'Select folder'
                }, false)
                    .then(function (selectedFolder) {
                    getSuToken()
                        .then(function (suToken) {
                        request('/admin-panel/workers/move-files.node.js', {
                            suToken: suToken,
                            sources: selectedFiles.map(function (selectedFile) { return selectedFile.path; }),
                            destination: selectedFolder
                        })
                            .then(function () {
                            notification('Moved Files', "Succesfully moved " + numifyNoun(selectedFiles.length, 'file', 'files') + " to <code>" + selectedFolder + "</code>");
                            // Refresh files
                            showFiles(path);
                        })
                            .catch(function (res) {
                            // This should never happen
                            notification('Unspecified Error', "status code: " + res.status + ", body: <code>" + res.response + "</code>");
                        });
                    });
                })
                    .catch(function () {
                    // User cancelled
                });
            };
            return /* html */ "\n\t\t\t\t\t\t\t\t\t\t<tr class=\"file-row\">\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-checkbox\">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type=\"checkbox\" onchange=\"handleFileCheckboxes(this)\">\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-icon\">\n\t\t\t\t\t\t\t\t\t\t\t\t<img class=\"file-manager-file-icon\" src=\"/admin-panel/img/file-icons/" + extension + ".png\" alt=\"" + extension + "\" onerror=\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tthis.src = '" + "/admin-panel/img/file-icons/unknown.png" + "'; this.onerror = null\n\t\t\t\t\t\t\t\t\t\t\t\t\">\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-name\" onclick=\"\n\t\t\t\t\t\t\t\t\t\t\t\t" + file.isDirectory + " ? showFiles('" + (path + file.name) + "/') : openFile('" + (path + file.name) + "')\n\t\t\t\t\t\t\t\t\t\t\t\">\n\t\t\t\t\t\t\t\t\t\t\t\t" + file.name + "\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-size\">\n\t\t\t\t\t\t\t\t\t\t\t\t" + (file.isDirectory ? file.filesInside + ' items' : size) + "\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-modified\">\n\t\t\t\t\t\t\t\t\t\t\t\t" + modified + "\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\n\t\t\t\t\t\t\t\t\t\t\t<td class=\"col-options\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"dropdown-menu\" onclick=\"toggleDropdown(this, event)\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"dropdown-menu-content\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small\" onclick=\"copyFile('" + (path + file.name) + "')\">Copy</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<br><br>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small\" onclick=\"moveFile('" + (path + file.name) + "')\">Move</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<br><br>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small\" onclick=\"renameFile('" + (path + file.name) + "')\">Rename</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<br><br>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button class=\"small red\" onclick=\"deleteFile('" + (path + file.name) + "')\">Delete</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t\t";
        }) + "\n\t\t\t\t\t\t</tbody>\n\n\t\t\t\t\t</table>\n\t\t\t\t</div>\n\t\t\t";
        initDropArea(path)
            .then(function () {
            // On file upload, refresh files
            showFiles(path);
        });
    })
        .catch(handleRequestError);
};
/*

    4.5 Delete File

*/
var deleteFile = function (filePath) {
    popup('Deleting file', "Are you sure you want to delete file: <code>" + filePath + "</code>?", [
        {
            name: 'Delete',
            classes: ['red']
        },
        {
            name: 'Cancel'
        },
    ])
        .then(function (popupRes) {
        if (popupRes.buttonName == 'Delete') {
            getSuToken()
                .then(function (suToken) {
                request('/admin-panel/workers/delete-file.node.js', {
                    suToken: suToken,
                    filePath: filePath
                })
                    .then(function () {
                    showFiles(new URLSearchParams(document.location.search).get('path'));
                })
                    .catch(handleRequestError);
            });
        }
    })
        .catch(function () {
        // User cancelled
    });
};
/*

    4.6 Copy File and Move File

*/
var copyFile = function (sourcePath) { return copyOrMoveFile(sourcePath, 'copy'); };
var moveFile = function (sourcePath) { return copyOrMoveFile(sourcePath, 'move'); };
// 4.6.1 Copy / Move File With Different Name
var copyOrMoveFile = function (sourcePath, mode) { return __awaiter(_this, void 0, void 0, function () {
    var destinationPath, suToken, pastSimpleVerb, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, filePicker({
                        type: 'new-file',
                        title: captitalise(mode) + " File",
                        body: "Select a folder to where you want to " + mode + " the file",
                        buttonText: 'Select folder',
                        newFileName: sourcePath.substring(sourcePath.lastIndexOf('/') + 1)
                    }, false)];
            case 1:
                destinationPath = _a.sent();
                return [4 /*yield*/, getSuToken()];
            case 2:
                suToken = _a.sent();
                return [4 /*yield*/, request("/admin-panel/workers/" + mode + "-file-different-name.node.js", {
                        suToken: suToken,
                        source: sourcePath,
                        destination: destinationPath
                    })
                        .catch(function (err) {
                        // This should never happen
                        notification('Unspecified Error', "status code: " + err.status + ", body: <code>" + err.response + "</code>");
                        throw err;
                    })];
            case 3:
                _a.sent();
                pastSimpleVerb = (mode == 'copy') ? 'copied' : 'moved';
                notification(captitalise(pastSimpleVerb) + " File", "Succesfully " + pastSimpleVerb + " file <code>" + sourcePath + "</code> to <code>" + destinationPath + "</code>");
                // Refresh files
                showFiles(new URLSearchParams(document.location.search).get('path'));
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
/*

    4.7 Rename File

*/
var renameFile = function (sourcePath) { return __awaiter(_this, void 0, void 0, function () {
    var popupRes, newName, dirPath, destinationPath, suToken, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, popup("Renaming File", "Enter a new name for <code>" + sourcePath.substring(sourcePath.lastIndexOf('/') + 1) + "</code>", [
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
                    ])];
            case 1:
                popupRes = _a.sent();
                if (!(popupRes.buttonName == 'Rename')) return [3 /*break*/, 4];
                newName = popupRes.inputs.get('new-name');
                dirPath = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);
                destinationPath = dirPath + newName;
                return [4 /*yield*/, getSuToken()];
            case 2:
                suToken = _a.sent();
                return [4 /*yield*/, request('/admin-panel/workers/move-file-different-name.node.js', {
                        suToken: suToken,
                        source: sourcePath,
                        destination: destinationPath
                    })
                        .catch(function (err) {
                        // This should never happen
                        notification('Unspecified Error', "status code: " + err.status + ", body: <code>" + err.response + "</code>");
                        throw err;
                    })];
            case 3:
                _a.sent();
                notification("Renamed file", "Succesfully renamed file <code>" + sourcePath + "</code> to <code>" + destinationPath + "</code>");
                // Refresh files
                showFiles(new URLSearchParams(document.location.search).get('path'));
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_2 = _a.sent();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
/*

    4.8 Create New Directory

*/
var createNewDirectory = function (parentDirectoryPath) { return __awaiter(_this, void 0, void 0, function () {
    var popupRes, newDirName, newDirectoryPath, suToken, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, popup('New Folder', "Creating a new folder in <code>" + parentDirectoryPath + "</code>", [
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
                    ])];
            case 1:
                popupRes = _a.sent();
                newDirName = popupRes.inputs.get('new-dir-name');
                newDirectoryPath = parentDirectoryPath + newDirName;
                return [4 /*yield*/, getSuToken()];
            case 2:
                suToken = _a.sent();
                return [4 /*yield*/, request('/admin-panel/workers/create-new-directory.node.js', {
                        suToken: suToken,
                        newDirectoryPath: newDirectoryPath
                    })
                        .catch(function (err) {
                        // This should never happen
                        notification('Unspecified Error', "status code: " + err.status + ", body: <code>" + err.response + "</code>");
                        throw err;
                    })];
            case 3:
                _a.sent();
                notification("Created directory", "Succesfully created directory <code>" + newDirName + "</code>");
                // Refresh files
                showFiles(new URLSearchParams(document.location.search).get('path'));
                return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
