class MinHeap {
  constructor () {
    this.data = []
  }

  getParentIndex (index) {
    return Math.floor((index + 1) / 2) - 1
  }

  getLeftIndex (index) {
    return 2 * (index + 1) - 1
  }

  getRightIndex (index) {
    return 2 * (index + 1)
  }

  insert (node) {
    this.data.push(node)
    this.heapifyUp(this.data.length - 1)
  }

  removeTop () {
    if (this.data.length == 1) {
      this.data.pop()
    } else if (this.data.length > 1) {
      this.data[0] = this.data.pop()
      this.heapifyDown(0)
    }
  }

  heapifyUp (index) {
    let currentNodeIndex = index
    while (true) {
      let currentNode = this.data[currentNodeIndex]
      let parentNodeIndex = this.getParentIndex(currentNodeIndex)
      if (parentNodeIndex < 0) {
        break
      }
      let parentNode = this.data[parentNodeIndex]

      if (parentNode <= currentNode) {
        break
      } else {
        this.data[currentNodeIndex] = parentNode
        this.data[parentNodeIndex] = currentNode
        currentNodeIndex = parentNodeIndex
      }
    }
  }

  heapifyDown (index) {
    let currentNodeIndex = index

    while (true) {
      let currentNode     = this.data[currentNodeIndex]
      let leftChildIndex  = this.getLeftIndex(currentNodeIndex)
      let rightChildIndex = this.getRightIndex(currentNodeIndex)

      let leftChildNode = leftChildIndex   > this.data.length - 1 ? Infinity : this.data[leftChildIndex]
      let rightChildNode = rightChildIndex > this.data.length - 1 ? Infinity : this.data[rightChildIndex]

      if (leftChildNode < rightChildNode && currentNode > leftChildNode) {
        this.data[currentNodeIndex] = leftChildNode
        this.data[leftChildIndex] = currentNode
        currentNodeIndex = leftChildIndex
      } else if (leftChildNode >= rightChildNode && currentNode > rightChildNode) {
        this.data[currentNodeIndex] = rightChildNode
        this.data[rightChildIndex] = currentNode
        currentNodeIndex = rightChildIndex
      } else {
        break
      }
    }
  }

  buildHeap (arr) {
    this.data = arr
    let halfIndex = Math.floor(arr.length / 2) - 1
    for (var i = this.getParentIndex(this.data.length - 1); i >= 0; i--) {
      this.heapifyDown(i)
    }
  }

}
