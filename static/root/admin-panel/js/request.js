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
var _this = this;
var request = function (url, method, body, files) {
    if (method === void 0) { method = 'GET'; }
    if (body === void 0) { body = {}; }
    if (files === void 0) { files = []; }
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var req, start, stringifiedBody, res, i, file, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    stringifiedBody = JSON.stringify(body);
                    res = stringToArrayBuffer(stringifiedBody);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < files.length)) return [3 /*break*/, 4];
                    file = files[i];
                    return [4 /*yield*/, file.arrayBuffer()
                        // Todo: optimise memory complexity, concatenating each file is heavy
                    ];
                case 2:
                    data = _a.sent();
                    // Todo: optimise memory complexity, concatenating each file is heavy
                    res = concatArrayBuffers(res, stringToArrayBuffer("\n--------------------file\n " + JSON.stringify({
                        name: file.name,
                        lastModified: file.lastModified,
                        size: file.size,
                        type: file.type
                    }) + "\n"));
                    res = concatArrayBuffers(res, data);
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('prepared request in ' + (Date.now() - start) + 'ms');
                    req.send(res);
                    return [2 /*return*/];
            }
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
var stringToArrayBuffer = function (str) {
    var buffer = new ArrayBuffer(str.length);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return buffer;
};
var concatArrayBuffers = function (ab1, ab2) {
    var out = new Uint8Array(ab1.byteLength + ab2.byteLength);
    out.set(new Uint8Array(ab1), 0);
    out.set(new Uint8Array(ab2), ab1.byteLength);
    return out.buffer;
};
