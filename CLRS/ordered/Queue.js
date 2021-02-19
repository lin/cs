class Queue {
  constructor (array) {
    this.data = array || []
  }

  enqueue (val) {
    this.data.unshift(val)
  }

  dequeue () {
    return this.data.pop()
  }

  isEmpty () {
    return this.data.length == 0
  }

  front () {
    return this.data[this.data.length - 1]
  }

  buildQueue (arr) {
    for (var i = 0; i < arr.length; i++) {
      this.enqueue(arr[i])
    }
  }
}

module.exports = Queue
