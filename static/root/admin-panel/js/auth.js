// Save superuser token in memory
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
var globalSuToken;
var getSuToken = function (loginData, secondTry) {
    if (secondTry === void 0) { secondTry = false; }
    return __awaiter(_this, void 0, void 0, function () {
        var res, padlockImage, res_1, popupResult, password, err_1, popupResult, password, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(globalSuToken == undefined)) return [3 /*break*/, 17];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 16]);
                    return [4 /*yield*/, request('/admin-panel/workers/get-su-token.node.js', { loginData: loginData })
                        // Open the padlock icon
                    ];
                case 2:
                    res = _a.sent();
                    padlockImage = $('#padlock > img');
                    padlockImage.src = '/admin-panel/img/unlocked-padlock-green.png';
                    // Set the suToken globally
                    globalSuToken = res.body;
                    return [2 /*return*/, globalSuToken];
                case 3:
                    res_1 = _a.sent();
                    if (!(res_1.status == 403)) return [3 /*break*/, 14];
                    if (!secondTry) return [3 /*break*/, 9];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, popup('Incorrect Password', 'Please try again...', [
                            {
                                name: 'Submit'
                            }
                        ], [
                            {
                                name: 'password',
                                placeholder: 'Enter your password...',
                                type: 'password',
                                enterTriggersButton: 'Submit'
                            }
                        ])];
                case 5:
                    popupResult = _a.sent();
                    password = popupResult.inputs.get('password');
                    return [4 /*yield*/, getSuToken({ username: Cookies.get('username'), password: password }, true)];
                case 6: return [2 /*return*/, _a.sent()];
                case 7:
                    err_1 = _a.sent();
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 13];
                case 9:
                    _a.trys.push([9, 12, , 13]);
                    return [4 /*yield*/, popup('Authentication Required', 'Please enter your password', [
                            {
                                name: 'Submit'
                            }
                        ], [
                            {
                                name: 'password',
                                placeholder: 'Enter your password...',
                                type: 'password',
                                enterTriggersButton: 'Submit'
                            }
                        ])];
                case 10:
                    popupResult = _a.sent();
                    password = popupResult.inputs.get('password');
                    return [4 /*yield*/, getSuToken({ username: Cookies.get('username'), password: password }, true)];
                case 11: return [2 /*return*/, _a.sent()];
                case 12:
                    err_2 = _a.sent();
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 15];
                case 14:
                    // This should never happen
                    notification('Unspecified Error', "status code: " + res_1.status + ", body: <code>" + res_1.response + "</code>");
                    _a.label = 15;
                case 15: return [3 /*break*/, 16];
                case 16: return [3 /*break*/, 18];
                case 17: return [2 /*return*/, globalSuToken];
                case 18: return [2 /*return*/];
            }
        });
    });
};
var togglePadlock = function () { return __awaiter(_this, void 0, void 0, function () {
    var padlockImage, suToken, padlockImage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(globalSuToken != undefined)) return [3 /*break*/, 1];
                globalSuToken = undefined;
                padlockImage = $('#padlock > img');
                padlockImage.src = '/admin-panel/img/locked-padlock-orange.png';
                padlockImage.title = 'You are currently not authorised to make changes, click here to gain permission';
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, getSuToken()];
            case 2:
                suToken = _a.sent();
                if (suToken != undefined) {
                    padlockImage = $('#padlock > img');
                    padlockImage.src = '/admin-panel/img/unlocked-padlock-green.png';
                    padlockImage.title = 'You are currently authorised to make changes';
                }
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
