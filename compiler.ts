import * as fs from 'fs'
import * as chalk from 'chalk'
import { db, Table } from 'node-json-database'
import { spawn } from 'child_process'
import { resolve as resolvePath } from 'path'
import { dotDotSlashAttack } from './static/private-workers/security'

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

	// Store all already compiled pages in a Set
	// We will remove all compiled pages that we don't need anymore later on

	const pagesToRemove = new Set<string>()
	const compiledPages = pagesDB.table('compiled_pages').get().rows

	for (let compiledPage of compiledPages) {
		pagesToRemove.add(compiledPage.path)
	}

	// Compile all pages

	const compilePage = (
		page: ReturnType<PageCompiler>,
		pageID: number
	) => {
		// Create directory, if needed

		const directory = getDirectory('./root' + page.path)

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
			console.log(`${ chalk.green('✔') } Created directory: ${ chalk.yellow(directory) }`)
		}

		// Check for malicious user input

		if (dotDotSlashAttack(`./root/${ page.path }`, './root')) {
			throw new Error(`Malicious user input detected. Page compiler prevented creation of ${ resolvePath(`./root/${ page.path }`) }.`)
		}

		// Write the file

		fs.writeFileSync('./root' + page.path, page.html)
		console.log(`${ chalk.green('✔') } Wrote file: ${ chalk.yellow(resolvePath('./root' + page.path)) }`)

		// Remove the page path from pagesToRemove

		pagesToRemove.delete(page.path)

		// Store the page path in the database

		const compiledPages = pagesDB.table('compiled_pages')
		const alreadyCompiledPages = compiledPages
			.get()
			.where(row => row.path == page.path)
			.rows

		// Only store if the path does not exist yet

		if (alreadyCompiledPages.length == 0) {
			compiledPages.insert([{ id: pageID, path: page.path }])
		}
	}

	for (let pageType of pageTypesTable.rows) {
		const pageCompiler = pageCompilers[pageType.name]
		const pages = pagesTable.where(row => row.pageType == pageType.name)

		if (pageType.compilePageType) {
			// Compile page type individually

			const page = pageCompiler(null, pages)
			compilePage(page, null /* Todo: what to do with the PageID? */)
		}

		// Compile all subpages

		for (let i = 0; i < pages.rows.length; i++) {
			const page = pageCompiler(pages.rows[i].pageContent, pages)
			compilePage(page, pages.rows[i].id)
		}
	}

	// Remove all unnecessary pages

	for (let pageToRemove of pagesToRemove) {
		const pagePath = `./root/${ pageToRemove }`

		if (fs.existsSync(pagePath)) {
			// Check for malicious user input

			if (dotDotSlashAttack(pagePath, './root')) {
				throw new Error(`Malicious user input detected. Page compiler prevented deletion of ${ resolvePath(pagePath) }.`)
			}

			// Delete file

			fs.unlinkSync(pagePath)

			// Delete path from compiled_pages table

			pagesDB.table('compiled_pages').deleteWhere(row => row.path == pageToRemove)

			console.log(`${ chalk.green('✔') } Deleted unnecessary file: ${ chalk.red(resolvePath(pagePath)) }`)
		}
	}

	deleteEmptyDirectories('./root')

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

const deleteEmptyDirectories = (dirPath: string) => {
	const files = fs.readdirSync(dirPath)

	if (files.length == 0) {
		// This directory is empty, delete it

		fs.rmdirSync(dirPath)
		console.log(`${ chalk.green('✔') } Deleted empty directory: ${ chalk.red(resolvePath(dirPath)) }`)
	} else {
		// Recursively call deleteEmptyDirectories on any subdirectory

		for (let file of files) {
			const subDirPath = `${ dirPath }/${ file }`

			if (fs.statSync(subDirPath).isDirectory()) {
				deleteEmptyDirectories(subDirPath)
			}
		}
	}

}

const install = () => new Promise<void>(resolve => {
	const installer = spawn('node', [ './install' ])
	installer.on('close', resolve)
})