import * as fs from 'fs'
import * as chalk from 'chalk'
import { db } from 'node-json-database'

type PageCompiler = (pageContent: Object, pages: Object) => {
	html: string
	path: string
}

interface ObjectOf<T> {
	[key: string]: T
}

// Write the ./root directory if it does not exist

if (!fs.existsSync('root')) {
	fs.mkdirSync('root')
}

const pagesDB = db('pages.json')

// Create database if it does not exist

if (!pagesDB.exists) {
	pagesDB.create()
}

// Create pageTypes table if it does not exist

if (!pagesDB.table('pageTypes').exists) {
	const table = pagesDB.table('pageTypes')

	table.create()

	table.columns.add([
		{
			name: 'name',
			dataType: 'String',
			constraints: [
				'primaryKey'
			]
		},
		{
			name: 'template',
			dataType: 'JSON',
			constraints: [
				'notNull'
			]
		},
		{
			name: 'canAdd',
			dataType: 'Boolean'
		}
	])
}

// Create pages table if it does not exist

if (!pagesDB.table('pages').exists) {
	const table = pagesDB.table('pages')

	table.create()

	table.columns.add([
		{
			name: 'id',
			dataType: 'Int',
			constraints: [
				'primaryKey',
				'autoIncrement'
			]
		},
		{
			name: 'pageType',
			dataType: 'String',
			foreignKey: {
				table: 'pageTypes',
				column: 'name'
			}
		},
		{
			name: 'pageContent',
			dataType: 'JSON',
			constraints: [
				'notNull'
			]
		}
	])
}

const pageTypesTable = pagesDB.table('pageTypes').get()
const pagesTable = pagesDB.table('pages').get()

export const compile = (compilePage: ObjectOf<PageCompiler>) => {
	// Store start time

	const start = Date.now()

	// Compile all pages
	
	for (let pageType of pageTypesTable.rows) {
		const pages = pagesTable.where(row => row.pageType == pageType.name).rows

		for (let i = 0; i < pages.length; i++) {
			const pageCompiler = compilePage[pageType.name]
			const page = pageCompiler(pages[i].pageContent, pagesTable)

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