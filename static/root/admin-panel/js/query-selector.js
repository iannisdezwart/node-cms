const $ = (query) => document.querySelector(query);
const $a = (query) => Array.prototype.slice.call(document.querySelectorAll(query));
HTMLElement.prototype.$ = function (query) {
    return this.querySelector(query);
};
HTMLElement.prototype.$a = function (query) {
    return Array.prototype.slice.call(this.querySelectorAll(query));
};
