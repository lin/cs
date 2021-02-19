// from the start to the end
// insert a new element to a sorted array
function insertionSort (array) {

  for (var i = 1; i < array.length; i++) {
    let current = array[i]
    j = i - 1 // insert to the first element.
    while (j >= 0 && array[j] > current) {
      array[j + 1] = array[j] // shift the larger elments
      j-- // move the cursor to the next
    }
    array[j + 1] = current // the cursor is one element away
  }

  return array
}
