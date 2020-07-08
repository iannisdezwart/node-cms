/*

	======= Info =======

	" This file will install and create
		the directory tree of NodeCMS.
		It is run when NodeCMS gets installed
		by NPM (`npm install @iannisz/node-cms`).

	======= Table of Contents =======

	1. Imports and functions
		1.1 Recursive rimraf
		1.2 Random String

	2. Creation of directory tree

*/

/* ===================
	1. Imports and functions
=================== */

import * as fs from 'fs'
import * as qcd from 'queued-copy-dir'
import { db } from 'node-json-database'

const args = process.argv.slice(2)
const workingDirectory = args[0]

process.chdir(workingDirectory)

/*
	1.1 Recursive rimraf
*/

const rimraf = (parentPath: string) => {
	if (fs.existsSync(parentPath)) {
		const files = fs.readdirSync(parentPath)

		for (let file of files) {
			const childPath = parentPath + '/' + file
			const stats = fs.statSync(childPath)

			if (stats.isDirectory()) {
				rimraf(childPath)
			} else {
				fs.unlinkSync(childPath)
			}
		}

		fs.rmdirSync(parentPath)
	}
}

/*
	1.2 Random String
*/

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

/* ===================
	2. Creation of directory tree
=================== */

// Create ./root directory

if (!fs.existsSync('root')) {
	fs.mkdirSync('root')
}

// Overwrite ./root/admin-panel directory

if (fs.existsSync('root/admin-panel')) {
	rimraf('root/admin-panel')
}

qcd.sync(__dirname + '/static/root/admin-panel', 'root/admin-panel')

// Create ./root/content directory

if (!fs.existsSync('root/content')) {
	fs.mkdirSync('root/content')
}

// Overwrite ./private-workers directory

if (fs.existsSync('private-workers')) {
	rimraf('private-workers')
}

qcd.sync(__dirname + '/static/private-workers', 'private-workers')

// Create User Database

const usersDB = db('users.json')

if (!usersDB.exists) {
	usersDB.create()
}

const adminsTable = usersDB.table('admins')

if (!adminsTable.exists) {
	adminsTable.create()

	adminsTable.columns.add([
		{
			name: 'userID',
			dataType: 'Int',
			constraints: [
				'autoIncrement',
				'primaryKey'
			]
		},
		{
			name: 'username',
			dataType: 'String',
			constraints: [
				'unique',
				'notNull'
			]
		},
		{
			name: 'password',
			dataType: 'String',
			constraints: [
				'notNull'
			]
		},
		{
			name: 'passwordSalt',
			dataType: 'String',
			constraints: [
				'notNull'
			]
		}
	])
}

// Create Pages Database

const pagesDB = db('pages.json')

if (!pagesDB.exists) {
	pagesDB.create()
}

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
			dataType: 'Boolean',
			constraints: [
				'notNull'
			]
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

// Create .jwtsecret

if (!fs.existsSync('.jwtsecret')) {
	fs.writeFileSync('.jwtsecret', randomString(128, {
		lowerCaseAlphabetical: true,
		upperCaseAlphabetical: true,
		underscore: true,
		dash: true,
		numbers: true,
		upperKeyboardRowSymbols: true,
		rightSideKeyboardSymbolsExclQuotes: true,
		quotes: true
	}))
}