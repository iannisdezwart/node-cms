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
var request = function (url, method, body, files) {
    if (method === void 0) { method = 'GET'; }
    if (body === void 0) { body = {}; }
    if (files === void 0) { files = []; }
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var req, start, stream;
        return __generator(this, function (_a) {
            req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status >= 200 && req.status < 300) {
                        resolve(req.response);
                    }
                    else {
                        reject({ status: req.status, response: req.responseText });
                    }
                }
            };
            req.open(method, url);
            start = Date.now();
            stream = new ReadableStream({
                start: function (controller) {
                    var e_1, _a;
                    var _this = this;
                    var stringifiedBody = JSON.stringify(body);
                    controller.enqueue(stringToUint8Array(stringifiedBody));
                    var _loop_1 = function (file) {
                        controller.enqueue(stringToUint8Array("\n--------------------file\n" + JSON.stringify({
                            name: file.name,
                            lastModified: file.lastModified,
                            size: file.size,
                            type: file.type
                        }) + "\n"));
                        var fileStream = file.stream();
                        var reader = fileStream.getReader();
                        var enqueueNextChunk = function () { return __awaiter(_this, void 0, void 0, function () {
                            var chunk;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, reader.read()];
                                    case 1:
                                        chunk = _a.sent();
                                        if (!chunk.done) {
                                            controller.enqueue(chunk.value);
                                            enqueueNextChunk();
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        enqueueNextChunk();
                    };
                    try {
                        for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                            var file = files_1_1.value;
                            _loop_1(file);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
            console.log('prepared request in ' + (Date.now() - start) + 'ms');
            req.send(stream);
            return [2 /*return*/];
        });
    }); });
};
var handleRequestError = function (err) {
    if (err.status == 403) {
        // This should only happen on a session timeout
        // Clear the suToken
        globalSuToken = undefined;
        notification('Session Timed Out', "Please retry.");
    }
    else {
        // This should never happen
        notification('Session', "status code: " + err.status + ", body: <code>" + err.response + "</code>");
    }
};
var stringToUint8Array = function (str) {
    var arr = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
};
