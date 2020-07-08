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
var request = function (url, method, body, files) {
    if (method === void 0) { method = 'GET'; }
    if (body === void 0) { body = {}; }
    if (files === void 0) { files = []; }
    return new Promise(function (resolve, reject) {
        var e_1, _a;
        var req = new XMLHttpRequest();
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
        var formData = new FormData();
        if (body != undefined) {
            formData.append('body', JSON.stringify(body));
        }
        if (files != undefined) {
            try {
                for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                    var file = files_1_1.value;
                    formData.append(file.name, file);
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
        req.send(formData);
    });
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
