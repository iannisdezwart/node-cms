// Bytes etc.

const parseSize = (size: number) => {
	let suffixes = [ 'B', 'kB', 'MB', 'GB' ]
	let i = 0

	while (size >= 1024 && i < suffixes.length) {
		i++
		size /= 1024
	}

	return ((i == 0) ? size : size.toFixed(2)) + ' ' + suffixes[i]
}

// Datetime

const parseDate = (dateString: string) => {
	const parsedDate = new Date(dateString)

	const getMinutes = (date: Date) => {
		let minutes = date.getMinutes().toString()

		if (minutes.length == 1) {
			minutes = '0' + minutes
		}

		return minutes
	}

	const isSameDate = (date1: Date, date2: Date) => {
		if (date1.getFullYear() == date2.getFullYear()) {
			if (date1.getMonth() == date2.getMonth()) {
				if (date1.getDate() == date2.getDate()) {
					return true
				}
			}
		}
		
		return false
	}

	const isSameYear = (date1: Date, date2: Date) => date1.getFullYear() == date2.getFullYear()

	const yesterday = () => new Date(Date.now() - 1000 * 60 * 60 * 24)

	const lessThenXDaysAgo = (date: Date, x: number) =>
		Date.now() - 1000 * 60 * 60 * 24 * x < date.getTime()

	const getDayName = (date: Date) => [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ][date.getDay()]

	const getMonthName = (date: Date) => [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ][date.getMonth()]

	const getOrdinalDate = (date: Date) => {
		const num = date.getDate()
		let ordinal: string

		if (num == 1 || num == 21 || num == 31) {
			ordinal = 'st'
		} else if (num == 2 || num == 22) {
			ordinal = 'nd'
		} else if (num == 3 || num == 23) {
			ordinal = 'rd'
		} else if (num == 21) {
			ordinal = 'st'
		} else {
			ordinal = 'th'
		}

		return num + ordinal
	}

	if (isSameDate(parsedDate, new Date())) {
		return `Today at ${ parsedDate.getHours() }:${ getMinutes(parsedDate) }`
	}

	if (isSameDate(parsedDate, yesterday())) {
		return `Yesterday at ${ parsedDate.getHours() }:${ getMinutes(parsedDate) }`
	}

	if (lessThenXDaysAgo(parsedDate, 7)) {
		return `${ getDayName(parsedDate) } at ${ parsedDate.getHours() }:${ getMinutes(parsedDate) }`
	}

	if (isSameYear(parsedDate, new Date())) {
		return `${ getMonthName(parsedDate) } ${ getOrdinalDate(parsedDate) }`
	}

	return `${ getMonthName(parsedDate) } ${ getOrdinalDate(parsedDate) } ${ parsedDate.getFullYear() }`
}

// Singular, Plural

const numifyNoun = (number: number, singularForm: string, pluralForm: string) => {
	if (number == 1) {
		return number + ' ' + singularForm
	} else {
		return number + ' ' + pluralForm
	}
}

// Random String

interface RandomCharSetsOptions {
	lowerCaseAlphabetical: boolean
	upperCaseAlphabetical: boolean
	underscore: boolean
	dash: boolean
	numbers: boolean
	upperKeyboardRowSymbols: boolean
	rightSideKeyboardSymbolsExclQuotes: boolean
	quotes: boolean
}

const randomCharSets = {
	lowerCaseAlphabetical: 'abcdefghijklmnopqrstuvwxyz',
	upperCaseAlphabetical: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	underscore: '_',
	dash: '-',
	numbers: '0123456789',
	upperKeyboardRowSymbols: '!@#$%^&*()+=',
	rightSideKeyboardSymbolsExclQuotes: '[{]}|\\;:,<.>/?',
	quotes: '\'"'
}

const randomString = (length: number, sets?: RandomCharSetsOptions) => {
	sets = {
		...{
			lowerCaseAlphabetical: true,
			upperCaseAlphabetical: true,
			underscore: true,
			dash: true,
			numbers: true,
			upperKeyboardRowSymbols: false,
			rightSideKeyboardSymbolsExclQuotes: false,
			quotes: false
		},
		...sets
	}

	let chars = ''
	
	for (let set in sets) {
		if (sets[set]) {
			chars += randomCharSets[set]
		}
	}

	let string = ''

	for (let i = 0; i < length; i++) {
		string += chars.charAt(randomIntBetween(0, chars.length - 1))
	}

	return string
}

const randomIntBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

// Capitalise

const captitalise = (string: string) => string.substring(0, 1).toUpperCase() + string.substring(1)

// Get file extension

const getExtension = (filePath: string) => {
	const dotIndex = filePath.lastIndexOf('.')

	if (dotIndex == -1) {
		return ''
	}

	return filePath.substring(dotIndex + 1)
}

// Image extensions

const imageExtensions = new Set([
	'jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'webp'
])