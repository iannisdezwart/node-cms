/*

	===== Info About This File =====

	" This is the main typescript file for JS-DSA-lib (JS Data Structures & Algorithms).

	- Package name: js-dsa-lib
	- Author: Iannis de Zwart (https://github.com/iannisdezwart)

	===== Table of Contents =====

	1. Queue
		1.1 Queue main class
		1.2 QueueNode class

	2. Stack
		2.1 Stack main class
		2.2 StackNode class

	3. Linked List
		3.1 LinkedList main class
		3.2 LinkedListNode class
		3.3 DoublyLinkedList main class
		3.4 DoublyLinkedListNode class

	4. Graph

	5. Tree
*/

/* ===================
	1. Queue
=================== */

/*
	1.1 Queue main class
*/

class Queue<T> {
	first: QueueNode<T>
	last: QueueNode<T>
	size = 0

	constructor() {}

	push(data: T) {
		if (this.size == 0) {
			const newNode = new QueueNode(data)

			this.first = newNode
			this.last = newNode
		} else {
			const newNode = new QueueNode(data)

			this.last.next = newNode
			this.last = this.last.next
		}

		this.size++
	}

	shift() {
		if (this.size == 0) {
			throw new Error(`Cannot shift an empty Queue.`)
		}

		const { data } = this.first

		this.first = this.first.next
		this.size--

		return data
	}

	toArray() {
		let currentNode = this.first
		let i = 0
		const array: T[] = new Array(this.size)

		while (currentNode != null) {
			array[i] = currentNode.data

			currentNode = currentNode.next
			i++
		}

		return array
	}

	isEmpty() {
		return this.size == 0
	}
}

/*
	1.2 QueueNode class
*/

class QueueNode<T> {
	data: T
	next: QueueNode<T>

	constructor(data: T) {
		this.data = data
	}
}

/* ===================
	2. Stack
=================== */

/*
	2.1 Stack main class
*/

class Stack<T> {
	bottom: StackNode<T>
	top: StackNode<T>
	size = 0

	constructor() {}

	push(data: T) {
		if (this.size == 0) {
			const newNode = new StackNode(data, null)

			this.bottom = newNode
			this.top = newNode
		} else {
			const newNode = new StackNode(data, this.top)

			this.top.next = newNode
			this.top = this.top.next
		}

		this.size++
	}

	pop() {
		if (this.size == 0) {
			throw new Error(`Cannot pop an empty Stack.`)
		}

		const { data } = this.top

		this.top = this.top.prev
		this.size--

		if (this.size > 0) {
			// Remove link to next node

			this.top.next = null
		} else {
			// Remove the bottom node

			this.bottom = null
		}

		return data
	}

	toArray() {
		let currentNode = this.bottom
		let i = 0
		const array: T[] = new Array(this.size)

		while (currentNode != null) {
			array[i] = currentNode.data

			currentNode = currentNode.next
			i++
		}

		return array
	}

	isEmpty() {
		return this.size == 0
	}
}

/*
	2.2 StackNode class
*/

class StackNode<T> {
	data: T
	prev: StackNode<T>
	next: StackNode<T>

	constructor(data: T, prev: StackNode<T>) {
		this.data = data
		this.prev = prev
	}
}

/* ===================
	3. Linked List
=================== */

/*
	3.1 LinkedList main class
*/

class LinkedList<T> {
	head: LinkedListNode<T> = null
	size = 0

	constructor() {}

	insert(data: T) {
		if (this.head == null) {
			this.head = new LinkedListNode<T>(data)
		} else {
			let currentNode = this.head

			if (currentNode.next == null) {
				currentNode.next = new LinkedListNode<T>(data)
			} else {
				while (currentNode.next != null) {
					currentNode = currentNode.next
				}

				currentNode.next = new LinkedListNode<T>(data)
			}
		}

		this.size++
	}

	insertBeforeHead(data: T) {
		if (this.head != null) {
			const newNode = new LinkedListNode<T>(data)

			newNode.next = this.head
			this.head = newNode
		} else {
			this.head = new LinkedListNode<T>(data)
		}

		this.size++
	}

	delete(data: T, multiple = false) {
		if (this.head == null) {
			return
		}

		if (this.head.data == data) {
			this.deleteHead()

			if (multiple) {
				this.delete(data, multiple)
			}

			return
		}

		if (this.head.next != null) {
			let currentNode = this.head

			while (currentNode.next != null) {
				if (currentNode.next.data == data) {
					currentNode.next = currentNode.next.next
					this.size--

					if (!multiple) {
						break
					}
				}

				currentNode = currentNode.next
			}
		}
	}

	deleteHead() {
		if (this.head != null) {
			const newHead = this.head.next

			this.head = newHead

			this.size--
		}
	}

	search(data: T) {
		let currentNode = this.head
		let found = 0

		while (currentNode != null) {
			if (currentNode.data == data) {
				found++
			}

			currentNode = currentNode.next
		}

		return found
	}

	toArray() {
		let currentNode = this.head
		let i = 0
		let array: T[] = new Array(this.size)

		while (currentNode != null) {
			array[i] = currentNode.data

			currentNode = currentNode.next
			i++
		}

		return array
	}

	isEmpty() {
		return this.size == 0
	}
}

/*
	3.2 DoublyLinkedListNode
*/

class LinkedListNode<T> {
	data: T
	next: LinkedListNode<T>

	constructor(data: T) {
		this.data = data
		this.next = null
	}
}

/*
	3.3 DoublyLinkedList main class
*/

class DoublyLinkedList<T> {
	head: DoublyLinkedListNode<T> = null
	size = 0

	constructor() {}

	insert(data: T) {
		if (this.head == null) {
			this.head = new DoublyLinkedListNode<T>(data, null)
		} else {
			let currentNode = this.head

			if (currentNode.next == null) {
				currentNode.next = new DoublyLinkedListNode<T>(data, currentNode)
			} else {
				while (currentNode.next != null) {
					currentNode = currentNode.next
				}

				currentNode.next = new DoublyLinkedListNode<T>(data, currentNode)
			}
		}

		this.size++
	}

	insertBeforeHead(data: T) {
		if (this.head != null) {
			const newNode = new DoublyLinkedListNode<T>(data, null)

			newNode.next = this.head
			this.head.prev = newNode
			this.head = newNode
		} else {
			this.head = new DoublyLinkedListNode<T>(data, null)
		}

		this.size++
	}

	delete(data: T, multiple = false) {
		if (this.head == null) {
			return
		}

		if (this.head.data == data) {
			this.deleteHead()

			if (multiple) {
				this.delete(data, multiple)
			}

			return
		}

		if (this.head.next != null) {
			let currentNode = this.head

			while (currentNode.next != null) {
				if (currentNode.next.data == data) {
					currentNode.next = currentNode.next.next
					this.size--

					if (!multiple) {
						break
					}
				}

				currentNode = currentNode.next
			}
		}
	}

	deleteHead() {
		if (this.head != null) {
			const newHead = this.head.next

			this.head = newHead

			this.size--
		}
	}

	search(data: T) {
		let currentNode = this.head
		let found = 0

		while (currentNode != null) {
			if (currentNode.data == data) {
				found++
			}

			currentNode = currentNode.next
		}

		return found
	}

	toArray() {
		let currentNode = this.head
		let i = 0
		let array: T[] = new Array(this.size)

		while (currentNode != null) {
			array[i] = currentNode.data

			currentNode = currentNode.next
			i++
		}

		return array
	}

	isEmpty() {
		return this.size == 0
	}
}

/*
	3.4 DoublyLinkedListNode class
*/

class DoublyLinkedListNode<T> {
	data: T
	next: DoublyLinkedListNode<T>
	prev: DoublyLinkedListNode<T>

	constructor(data: T, prev: DoublyLinkedListNode<T>) {
		this.data = data
		this.next = null
		this.prev = prev
	}
}

/* ===================
	4. Graph
=================== */

// Todo: create
// https://www.freecodecamp.org/news/the-top-data-structures-you-should-know-for-your-next-coding-interview-36af0831f5e3/

/* ===================
	5. Tree
=================== */

// Todo: create