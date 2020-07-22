const $ = <T = HTMLElement>(
	query: string
) => document.querySelector(query) as unknown as T

const $a = <T = HTMLElement>(
	query: string
) => Array.prototype.slice.call(document.querySelectorAll(query)) as unknown as T[]