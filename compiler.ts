import * as fs from 'fs'
import * as chalk from 'chalk'
import { db, Table } from 'node-json-database'
import { spawn } from 'child_process'

type PageCompiler = (pageContent: Object, pages: Table) => {
	html: string
	path: string
}

interface ObjectOf<T> {
	[key: string]: T
}

export const compile = async (pageCompilers: ObjectOf<PageCompiler>) => {
	// Store start time

	const start = Date.now()

	// Write the ./root directory if it does not exist

	if (!fs.existsSync('root')) {
		fs.mkdirSync('root')
	}

	// Create database if it does not exist

	const pagesDB = db('pages.json')

	if (!pagesDB.exists) {
		await install()
	} else {
		// Create pageTypes table if it does not exist

		if (!pagesDB.table('pageTypes').exists || !pagesDB.table('pages').exists) {
			await install()
		}
	}

	// Get tables

	const pageTypesTable = pagesDB.table('pageTypes').get()
	const pagesTable = pagesDB.table('pages').get()

	// Compile all pages

	const compilePage = (page: ReturnType<PageCompiler>) => {
		// Create directory, if needed

		const directory = getDirectory('./root' + page.path)

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
			console.log(`${ chalk.green('✔') } Created directory: ${ chalk.yellow(directory) }`)
		}

		// Write the file

		fs.writeFileSync('./root' + page.path, page.html)
		console.log(`${ chalk.green('✔') } Wrote file: ${ chalk.yellow('./root' + page.path) }`)
	}

	for (let pageType of pageTypesTable.rows) {
		const pageCompiler = pageCompilers[pageType.name]
		const pages = pagesTable.where(row => row.pageType == pageType.name)

		if (pageType.compilePageType) {
			// Compile page type individually

			const page = pageCompiler(null, pages)
			compilePage(page)
		}

		// Compile all subpages

		for (let i = 0; i < pages.rows.length; i++) {
			const page = pageCompiler(pages.rows[i].pageContent, pages)
			compilePage(page)
		}
	}

	console.log(`${ chalk.green('✔') } Finished compilation in ${ Date.now() - start }ms`)
}

const getDirectory = (path: string) => {
	let currentChar = path.charAt(path.length - 1)

	while (currentChar != '/' && path.length > 0) {
		path = path.slice(0, path.length - 1)
		currentChar = path.charAt(path.length - 1)
	}

	return path
}

const install = () => new Promise<void>(resolve => {
	const installer = spawn('node', [ './install' ])
	installer.on('close', resolve)
})