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
var popup = function (title, body, buttons, inputs, disappearsAfterMs) {
    if (buttons === void 0) { buttons = []; }
    if (inputs === void 0) { inputs = []; }
    return new Promise(function (resolve, reject) {
        var e_1, _a, e_2, _b;
        var popupEl = document.createElement('div');
        popupEl.classList.add('popup');
        popupEl.innerHTML = /* html */ "\n\t\t<a class=\"popup-close-button\">\u2715</a>\n\t\t<h1 class=\"popup-title\">" + title + "</h1>\n\t\t<p class=\"popup-body\">" + body + "</p>\n\t";
        var getInputValues = function () {
            var e_3, _a;
            var inputResults = new Map();
            try {
                for (var inputs_2 = __values(inputs), inputs_2_1 = inputs_2.next(); !inputs_2_1.done; inputs_2_1 = inputs_2.next()) {
                    var input = inputs_2_1.value;
                    var value = $("input[data-name=\"" + input.name + "\"]").value;
                    inputResults.set(input.name, value);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (inputs_2_1 && !inputs_2_1.done && (_a = inputs_2.return)) _a.call(inputs_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return inputResults;
        };
        var removePopup = function () {
            popupEl.classList.add('closed');
            setTimeout(function () {
                popupEl.remove();
            }, 300);
        };
        var submitPopup = function (buttonName) {
            var inputResults = getInputValues();
            removePopup();
            resolve({
                buttonName: buttonName,
                inputs: inputResults
            });
        };
        var _loop_1 = function (input) {
            var inputEl = document.createElement('input');
            inputEl.type = input.type;
            inputEl.placeholder = input.placeholder;
            // Todo: fix this bug: the value is not shown
            if (input.value != undefined) {
                inputEl.value = input.value;
            }
            inputEl.setAttribute('data-name', input.name);
            // Create random ID in order to find the dynamically added element later on
            var randomId = randomString(10);
            inputEl.setAttribute('data-id', randomId);
            popupEl.appendChild(inputEl);
            popupEl.innerHTML += /* html */ "\n\t\t\t<br><br>\n\t\t";
            if (input.enterTriggersButton != undefined) {
                if (buttons.map(function (button) { return button.name; }).includes(input.enterTriggersButton)) {
                    addEventListener('keyup', function (e) {
                        var target = e.target;
                        if (target.getAttribute('data-id') == randomId) {
                            if (e.key == 'Enter') {
                                submitPopup(input.enterTriggersButton);
                            }
                        }
                    });
                }
            }
        };
        try {
            for (var inputs_1 = __values(inputs), inputs_1_1 = inputs_1.next(); !inputs_1_1.done; inputs_1_1 = inputs_1.next()) {
                var input = inputs_1_1.value;
                _loop_1(input);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (inputs_1_1 && !inputs_1_1.done && (_a = inputs_1.return)) _a.call(inputs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var _loop_2 = function (button) {
            var e_4, _a;
            var buttonEl = document.createElement('button');
            buttonEl.innerHTML = button.name;
            if (button.classes != undefined) {
                try {
                    for (var _b = (e_4 = void 0, __values(button.classes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var className = _c.value;
                        buttonEl.classList.add(className);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            buttonEl.classList.add('small');
            buttonEl.addEventListener('click', function () {
                var inputResults = getInputValues();
                removePopup();
                resolve({
                    buttonName: button.name,
                    inputs: inputResults
                });
            });
            popupEl.appendChild(buttonEl);
        };
        try {
            for (var buttons_1 = __values(buttons), buttons_1_1 = buttons_1.next(); !buttons_1_1.done; buttons_1_1 = buttons_1.next()) {
                var button = buttons_1_1.value;
                _loop_2(button);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (buttons_1_1 && !buttons_1_1.done && (_b = buttons_1.return)) _b.call(buttons_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Add popup to the page
        document.body.appendChild(popupEl);
        // Close popup when x button or escape is pressed
        popupEl.querySelector('a.popup-close-button').addEventListener('click', function () {
            removePopup();
            reject();
        });
        var escapePressHandler = function (e) {
            if (e.key == 'Escape') {
                removePopup();
                removeEventListener('keyup', escapePressHandler);
            }
        };
        addEventListener('keyup', escapePressHandler);
        if (disappearsAfterMs != undefined) {
            setTimeout(function () {
                removePopup();
                reject();
            }, disappearsAfterMs);
        }
    });
};
var notification = function (title, body, disappearsAfterMs) {
    if (disappearsAfterMs === void 0) { disappearsAfterMs = 3000; }
    return new Promise(function (resolve) {
        popup(title, body, [], [], disappearsAfterMs)
            // Buttonless popup can only reject
            .catch(resolve);
    });
};
