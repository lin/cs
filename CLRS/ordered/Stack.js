class Stack {
  constructor (array = []) {
    this.data = array
  }

  push (val) {
    this.data.push(val)
  }

  pop () {
    this.data.pop()
  }

  peek () {
    return this.data[this.data.length - 1]
  }
}
