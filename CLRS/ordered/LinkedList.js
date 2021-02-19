class ListNode {
  constructor (val) {
    this.value = val
    this.prev = null
    this.next = null
  }
}

class LinkedList {
  constructor () {
    this.head = null
    this.tail = null
  }

  peekFront () {
    return this.head ? this.head.value : 'Empty List'
  }

  insertAtFront (node) {
    if (this.head) {
      let prevHead = this.head
      node.next = prevHead
      prevHead.prev = node
      this.head = node
    } else {
      this.head = node
      this.tail = node
    }
  }

  removeFront () {
    if (this.head) {
      let prevNodeAfterHead = this.head.next
      if (prevNodeAfterHead) {
        this.head = prevNodeAfterHead
      } else {
        this.head = null
        this.tail = null
      }
    }
  }
}
