const MinHeap = require('../tree/MinHeap')

function heapSort (arr) {
  let h = new MinHeap()
  h.buildHeap(arr)

  let result = []
  let len = arr.length
  for (var i = 0; i < len; i++) {
    result.push(h.data[0])
    h.removeTop()
  }

  return result
}
