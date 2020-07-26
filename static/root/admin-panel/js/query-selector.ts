const $ = <T = HTMLElement>(
	query: string
) => document.querySelector(query) as unknown as T

const $a = <T = HTMLElement>(
	query: string
) => Array.prototype.slice.call(document.querySelectorAll(query)) as unknown as T[]

interface HTMLElement {
	$: <T = HTMLElement>(query: string) => T
	$a: <T = HTMLElement>(query: string) => T[]
}

HTMLElement.prototype.$ = function <T = HTMLElement>(
	query: string
) {
	return this.querySelector(query) as T
}

HTMLElement.prototype.$a = function <T = HTMLElement>(
	query: string
) {
	return Array.prototype.slice.call(this.querySelectorAll(query)) as T[]
}