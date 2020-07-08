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
var Queue = /** @class */ (function () {
    function Queue() {
        this.size = 0;
    }
    Queue.prototype.push = function (data) {
        if (this.size == 0) {
            var newNode = new QueueNode(data);
            this.first = newNode;
            this.last = newNode;
        }
        else {
            var newNode = new QueueNode(data);
            this.last.next = newNode;
            this.last = this.last.next;
        }
        this.size++;
    };
    Queue.prototype.shift = function () {
        if (this.size == 0) {
            throw new Error("Cannot shift an empty Queue.");
        }
        var data = this.first.data;
        this.first = this.first.next;
        this.size--;
        return data;
    };
    Queue.prototype.toArray = function () {
        var currentNode = this.first;
        var i = 0;
        var array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    };
    Queue.prototype.isEmpty = function () {
        return this.size == 0;
    };
    return Queue;
}());
/*
    1.2 QueueNode class
*/
var QueueNode = /** @class */ (function () {
    function QueueNode(data) {
        this.data = data;
    }
    return QueueNode;
}());
/* ===================
    2. Stack
=================== */
/*
    2.1 Stack main class
*/
var Stack = /** @class */ (function () {
    function Stack() {
        this.size = 0;
    }
    Stack.prototype.push = function (data) {
        if (this.size == 0) {
            var newNode = new StackNode(data, null);
            this.bottom = newNode;
            this.top = newNode;
        }
        else {
            var newNode = new StackNode(data, this.top);
            this.top.next = newNode;
            this.top = this.top.next;
        }
        this.size++;
    };
    Stack.prototype.pop = function () {
        if (this.size == 0) {
            throw new Error("Cannot pop an empty Stack.");
        }
        var data = this.top.data;
        this.top = this.top.prev;
        this.size--;
        return data;
    };
    Stack.prototype.toArray = function () {
        var currentNode = this.bottom;
        var i = 0;
        var array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    };
    Stack.prototype.isEmpty = function () {
        return this.size == 0;
    };
    return Stack;
}());
/*
    2.2 StackNode class
*/
var StackNode = /** @class */ (function () {
    function StackNode(data, prev) {
        this.data = data;
        this.prev = prev;
    }
    return StackNode;
}());
/* ===================
    3. Linked List
=================== */
/*
    3.1 LinkedList main class
*/
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        this.head = null;
        this.size = 0;
    }
    LinkedList.prototype.insert = function (data) {
        if (this.head == null) {
            this.head = new LinkedListNode(data);
        }
        else {
            var currentNode = this.head;
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
    };
    LinkedList.prototype.insertBeforeHead = function (data) {
        if (this.head != null) {
            var newNode = new LinkedListNode(data);
            newNode.next = this.head;
            this.head = newNode;
        }
        else {
            this.head = new LinkedListNode(data);
        }
        this.size++;
    };
    LinkedList.prototype.delete = function (data, multiple) {
        if (multiple === void 0) { multiple = false; }
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
            var currentNode = this.head;
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
    };
    LinkedList.prototype.deleteHead = function () {
        if (this.head != null) {
            var newHead = this.head.next;
            this.head = newHead;
            this.size--;
        }
    };
    LinkedList.prototype.search = function (data) {
        var currentNode = this.head;
        var found = 0;
        while (currentNode != null) {
            if (currentNode.data == data) {
                found++;
            }
            currentNode = currentNode.next;
        }
        return found;
    };
    LinkedList.prototype.toArray = function () {
        var currentNode = this.head;
        var i = 0;
        var array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    };
    LinkedList.prototype.isEmpty = function () {
        return this.size == 0;
    };
    return LinkedList;
}());
/*
    3.2 DoublyLinkedListNode
*/
var LinkedListNode = /** @class */ (function () {
    function LinkedListNode(data) {
        this.data = data;
        this.next = null;
    }
    return LinkedListNode;
}());
/*
    3.3 DoublyLinkedList main class
*/
var DoublyLinkedList = /** @class */ (function () {
    function DoublyLinkedList() {
        this.head = null;
        this.size = 0;
    }
    DoublyLinkedList.prototype.insert = function (data) {
        if (this.head == null) {
            this.head = new DoublyLinkedListNode(data, null);
        }
        else {
            var currentNode = this.head;
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
    };
    DoublyLinkedList.prototype.insertBeforeHead = function (data) {
        if (this.head != null) {
            var newNode = new DoublyLinkedListNode(data, null);
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        else {
            this.head = new DoublyLinkedListNode(data, null);
        }
        this.size++;
    };
    DoublyLinkedList.prototype.delete = function (data, multiple) {
        if (multiple === void 0) { multiple = false; }
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
            var currentNode = this.head;
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
    };
    DoublyLinkedList.prototype.deleteHead = function () {
        if (this.head != null) {
            var newHead = this.head.next;
            this.head = newHead;
            this.size--;
        }
    };
    DoublyLinkedList.prototype.search = function (data) {
        var currentNode = this.head;
        var found = 0;
        while (currentNode != null) {
            if (currentNode.data == data) {
                found++;
            }
            currentNode = currentNode.next;
        }
        return found;
    };
    DoublyLinkedList.prototype.toArray = function () {
        var currentNode = this.head;
        var i = 0;
        var array = new Array(this.size);
        while (currentNode != null) {
            array[i] = currentNode.data;
            currentNode = currentNode.next;
            i++;
        }
        return array;
    };
    DoublyLinkedList.prototype.isEmpty = function () {
        return this.size == 0;
    };
    return DoublyLinkedList;
}());
/*
    3.4 DoublyLinkedListNode class
*/
var DoublyLinkedListNode = /** @class */ (function () {
    function DoublyLinkedListNode(data, prev) {
        this.data = data;
        this.next = null;
        this.prev = prev;
    }
    return DoublyLinkedListNode;
}());
/* ===================
    4. Graph
=================== */
// Todo: create
// https://www.freecodecamp.org/news/the-top-data-structures-you-should-know-for-your-next-coding-interview-36af0831f5e3/
/* ===================
    5. Tree
=================== */
// Todo: create
