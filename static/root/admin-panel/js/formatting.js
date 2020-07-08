// Bytes etc.
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
var parseSize = function (size) {
    var suffixes = ['B', 'kB', 'MB', 'GB'];
    var i = 0;
    while (size >= 1024 && i < suffixes.length) {
        i++;
        size /= 1024;
    }
    return ((i == 0) ? size : size.toFixed(2)) + ' ' + suffixes[i];
};
// Datetime
var parseDate = function (dateString) {
    var parsedDate = new Date(dateString);
    var getMinutes = function (date) {
        var minutes = date.getMinutes().toString();
        if (minutes.length == 1) {
            minutes = '0' + minutes;
        }
        return minutes;
    };
    var isSameDate = function (date1, date2) {
        if (date1.getFullYear() == date2.getFullYear()) {
            if (date1.getMonth() == date2.getMonth()) {
                if (date1.getDate() == date2.getDate()) {
                    return true;
                }
            }
        }
        return false;
    };
    var isSameYear = function (date1, date2) { return date1.getFullYear() == date2.getFullYear(); };
    var yesterday = function () { return new Date(Date.now() - 1000 * 60 * 60 * 24); };
    var lessThenXDaysAgo = function (date, x) {
        return Date.now() - 1000 * 60 * 60 * 24 * x < date.getTime();
    };
    var getDayName = function (date) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]; };
    var getMonthName = function (date) { return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]; };
    var getOrdinalDate = function (date) {
        var num = date.getDate();
        var ordinal;
        if (num == 1 || num == 21 || num == 31) {
            ordinal = 'st';
        }
        else if (num == 2 || num == 22) {
            ordinal = 'nd';
        }
        else if (num == 3 || num == 23) {
            ordinal = 'rd';
        }
        else if (num == 21) {
            ordinal = 'st';
        }
        else {
            ordinal = 'th';
        }
        return num + ordinal;
    };
    if (isSameDate(parsedDate, new Date())) {
        return "Today at " + parsedDate.getHours() + ":" + getMinutes(parsedDate);
    }
    if (isSameDate(parsedDate, yesterday())) {
        return "Yesterday at " + parsedDate.getHours() + ":" + getMinutes(parsedDate);
    }
    if (lessThenXDaysAgo(parsedDate, 7)) {
        return getDayName(parsedDate) + " at " + parsedDate.getHours() + ":" + getMinutes(parsedDate);
    }
    if (isSameYear(parsedDate, new Date())) {
        return getMonthName(parsedDate) + " " + getOrdinalDate(parsedDate);
    }
    return getMonthName(parsedDate) + " " + getOrdinalDate(parsedDate) + " " + parsedDate.getFullYear();
};
// Singular, Plural
var numifyNoun = function (number, singularForm, pluralForm) {
    if (number == 1) {
        return number + ' ' + singularForm;
    }
    else {
        return number + ' ' + pluralForm;
    }
};
var randomCharSets = {
    lowerCaseAlphabetical: 'abcdefghijklmnopqrstuvwxyz',
    upperCaseAlphabetical: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    underscore: '_',
    dash: '-',
    numbers: '0123456789',
    upperKeyboardRowSymbols: '!@#$%^&*()+=',
    rightSideKeyboardSymbolsExclQuotes: '[{]}|\\;:,<.>/?',
    quotes: '\'"'
};
var randomString = function (length, sets) {
    sets = __assign({
        lowerCaseAlphabetical: true,
        upperCaseAlphabetical: true,
        underscore: true,
        dash: true,
        numbers: true,
        upperKeyboardRowSymbols: false,
        rightSideKeyboardSymbolsExclQuotes: false,
        quotes: false
    }, sets);
    var chars = '';
    for (var set in sets) {
        if (sets[set]) {
            chars += randomCharSets[set];
        }
    }
    var string = '';
    for (var i = 0; i < length; i++) {
        string += chars.charAt(randomIntBetween(0, chars.length - 1));
    }
    return string;
};
var randomIntBetween = function (min, max) { return Math.floor(Math.random() * (max - min + 1) + min); };
// Capitalise
var captitalise = function (string) { return string.substring(0, 1).toUpperCase() + string.substring(1); };
// Get file extension
var getExtension = function (filePath) {
    var dotIndex = filePath.lastIndexOf('.');
    if (dotIndex == -1) {
        return '';
    }
    return filePath.substring(dotIndex + 1);
};
// Image extensions
var imageExtensions = new Set([
    'jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'webp'
]);
