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
class Queue {
    constructor() {
        this.size = 0;
    }
    push(data) {
        if (this.size == 0) {
            const newNode = new QueueNode(data);
            this.first = newNode;
            this.last = newNode;
        }
        else {
            const newNode = new QueueNode(data);
            this.last.next = newNode;
            this.last = this.last.next;
        }
        this.size++;
    }
    shift() {
        if (this.size == 0) {
            throw new Error(`Cannot shift an empty Queue.`);
        }
        const { data } = this.first;
        this.first = this.first.next;
        this.size--;
        return data;
    }
    toArray() {
        let currentNode = this.first;
        let i = 0;
        const array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    }
    isEmpty() {
        return this.size == 0;
    }
}
/*
    1.2 QueueNode class
*/
class QueueNode {
    constructor(data) {
        this.data = data;
    }
}
/* ===================
    2. Stack
=================== */
/*
    2.1 Stack main class
*/
class Stack {
    constructor() {
        this.size = 0;
    }
    push(data) {
        if (this.size == 0) {
            const newNode = new StackNode(data, null);
            this.bottom = newNode;
            this.top = newNode;
        }
        else {
            const newNode = new StackNode(data, this.top);
            this.top.next = newNode;
            this.top = this.top.next;
        }
        this.size++;
    }
    pop() {
        if (this.size == 0) {
            throw new Error(`Cannot pop an empty Stack.`);
        }
        const { data } = this.top;
        this.top = this.top.prev;
        this.size--;
        if (this.size > 0) {
            // Remove link to next node
            this.top.next = null;
        }
        else {
            // Remove the bottom node
            this.bottom = null;
        }
        return data;
    }
    toArray() {
        let currentNode = this.bottom;
        let i = 0;
        const array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    }
    isEmpty() {
        return this.size == 0;
    }
}
/*
    2.2 StackNode class
*/
class StackNode {
    constructor(data, prev) {
        this.data = data;
        this.prev = prev;
    }
}
/* ===================
    3. Linked List
=================== */
/*
    3.1 LinkedList main class
*/
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    insert(data) {
        if (this.head == null) {
            this.head = new LinkedListNode(data);
        }
        else {
            let currentNode = this.head;
            if (currentNode.next == null) {
                currentNode.next = new LinkedListNode(data);
            }
            else {
                while (currentNode.next != null) {
                    currentNode = currentNode.next;
                }
                currentNode.next = new LinkedListNode(data);
            }
        }
        this.size++;
    }
    insertBeforeHead(data) {
        if (this.head != null) {
            const newNode = new LinkedListNode(data);
            newNode.next = this.head;
            this.head = newNode;
        }
        else {
            this.head = new LinkedListNode(data);
        }
        this.size++;
    }
    delete(data, multiple = false) {
        if (this.head == null) {
            return;
        }
        if (this.head.data == data) {
            this.deleteHead();
            if (multiple) {
                this.delete(data, multiple);
            }
            return;
        }
        if (this.head.next != null) {
            let currentNode = this.head;
            while (currentNode.next != null) {
                if (currentNode.next.data == data) {
                    currentNode.next = currentNode.next.next;
                    this.size--;
                    if (!multiple) {
                        break;
                    }
                }
                currentNode = currentNode.next;
            }
        }
    }
    deleteHead() {
        if (this.head != null) {
            const newHead = this.head.next;
            this.head = newHead;
            this.size--;
        }
    }
    search(data) {
        let currentNode = this.head;
        let found = 0;
        while (currentNode != null) {
            if (currentNode.data == data) {
                found++;
            }
            currentNode = currentNode.next;
        }
        return found;
    }
    toArray() {
        let currentNode = this.head;
        let i = 0;
        let array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    }
    isEmpty() {
        return this.size == 0;
    }
}
/*
    3.2 DoublyLinkedListNode
*/
class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}
/*
    3.3 DoublyLinkedList main class
*/
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    insert(data) {
        if (this.head == null) {
            this.head = new DoublyLinkedListNode(data, null);
        }
        else {
            let currentNode = this.head;
            if (currentNode.next == null) {
                currentNode.next = new DoublyLinkedListNode(data, currentNode);
            }
            else {
                while (currentNode.next != null) {
                    currentNode = currentNode.next;
                }
                currentNode.next = new DoublyLinkedListNode(data, currentNode);
            }
        }
        this.size++;
    }
    insertBeforeHead(data) {
        if (this.head != null) {
            const newNode = new DoublyLinkedListNode(data, null);
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        else {
            this.head = new DoublyLinkedListNode(data, null);
        }
        this.size++;
    }
    delete(data, multiple = false) {
        if (this.head == null) {
            return;
        }
        if (this.head.data == data) {
            this.deleteHead();
            if (multiple) {
                this.delete(data, multiple);
            }
            return;
        }
        if (this.head.next != null) {
            let currentNode = this.head;
            while (currentNode.next != null) {
                if (currentNode.next.data == data) {
                    currentNode.next = currentNode.next.next;
                    this.size--;
                    if (!multiple) {
                        break;
                    }
                }
                currentNode = currentNode.next;
            }
        }
    }
    deleteHead() {
        if (this.head != null) {
            const newHead = this.head.next;
            this.head = newHead;
            this.size--;
        }
    }
    search(data) {
        let currentNode = this.head;
        let found = 0;
        while (currentNode != null) {
            if (currentNode.data == data) {
                found++;
            }
            currentNode = currentNode.next;
        }
        return found;
    }
    toArray() {
        let currentNode = this.head;
        let i = 0;
        let array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    }
    isEmpty() {
        return this.size == 0;
    }
}
/*
    3.4 DoublyLinkedListNode class
*/
class DoublyLinkedListNode {
    constructor(data, prev) {
        this.data = data;
        this.next = null;
        this.prev = prev;
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
