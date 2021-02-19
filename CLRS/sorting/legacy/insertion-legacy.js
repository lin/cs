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

// no matter what you are trying to accomplish.
// you are trying to using iterative ways to save the
// repeated computations. That means we are trying to
// find something invariant during the loop or during the
// recursive calls.
//
// for recursive calls, things have to be able to the "same"
// at a certain level of concerns, so we can compute in the same way
// in this case. the solution is invariant to the sorted array, but not a
// unsorted array, that make this unrecurasivable.
function insertionSortRecursiveAttemption (array) {

  // to find an instance of recursive function, you have to find a
  // pattern to repeat.
  function insertToSortedArray (sortedArray, newElement) {
    // what is invariant in the process:
    // insert an element to a sorted array.
    // array is not a sorted array, so it can't use the
    // recursive manner.
    // the recursive is always calculated from the same class object
    // as the arguments. so all you need to think is that
    // is there a case that the same type arguments can feed into the function.
    let j = sortedArray.length - 1;
    while (j >= 0 && sortedArray[j] > newElement) {
      // copy and shift
      // this is a pattern where you shift all element right
      // which is a recursive formula: for all n > j, a_{n+1} = b_{n}
      // so that means we talk in a higher level, then we implemented using
      // programming languages.
      sortedArray[j + 1] = sortedArray[j]
      j--
    }

    sortedArray[j + 1] = newElement
    return sortedArray
  }

  let sortedArray = [array[0]]

  for (var i = 1; i < array.length; i++) {
    sortedArray = insertToSortedArray(sortedArray, array[i])
  }

  return sortedArray
}

console.log(insertionSort([5, 2, 4, 6, 1, 3]));
console.log(insertionSortRecursiveAttemption([5, 2, 4, 6, 1, 3]));
