export class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(item) {
        this.items.push(item);
    }
    dequeue() {
        return this.items.shift();
    }
    peek() {
        return this.items[0];
    }
    size() {
        return this.items.length;
    }
    isEmpty() {
        return this.items.length === 0;
    }
    toArray() {
        return [...this.items];
    }
}
//# sourceMappingURL=Queue.js.map