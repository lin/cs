function mergeSorted(array1, array2) {
  let i = 0;
  let j = 0;
  let mergedArray = [];

  while (i < array1.length) {
    if (array2[j]) {
      if (array1[i] < array2[j]) {
        mergedArray.push(array1[i])
        i++
      } else {
        mergedArray.push(array2[j])
        j++
      }
    } else {
      mergedArray.push(array1[i])
      i++
    }
  }

  while (j < array2.length) {
    mergedArray.push(array2[j])
    j++
  }

  return mergedArray
}

function mergeSortRecursive (array) {
  if (array.length == 1) {
    return array
  } else {
    let halfIndex = Math.ceil(array.length / 2)
    let firstHalf = mergeSortRecursive(array.slice(0, halfIndex))
    let secondHalf = mergeSortRecursive(array.slice(halfIndex))
    return mergeSorted(firstHalf, secondHalf)
  }
}

function mergeSortStack (array) {
  let splitedArray = array
  let stack = [splitedArray]

  while (stack.length) {
    // maybe while loop here later
    let current = stack[stack.length - 1] // reference the splitedArray, great!
    stack.pop()

    if (current.length !== 1) {
      let halfIndex  = Math.ceil(current.length / 2)
      let firstHalf  = current.slice(0, halfIndex)
      let secondHalf = current.slice(halfIndex)
      stack.push(secondHalf)
      stack.push(firstHalf)
    }
  }

}

function mergeSortStack (array) {
  let splitedArray = array
  let stack = [{
    data: splitedArray,
    sorted: false
  }]
  let counter = 0

  function isSorted (elem) {
    return elem.sorted || elem.length == 1
  }

  while (stack.length && counter < 5) {
    // maybe while loop here later
    let currentElement = stack[stack.length - 1]
    let current = currentElement.data
    stack.pop()

    let topElement = stack[stack.length - 1] || null

    if (isSorted(currentElement) && isSorted(topElement)) {
      stack.push({
        data: mergeSorted(current, topElement.data),
        sorted: true
      })
    }

    if (!isSorted(currentElement)) {
      let halfIndex  = Math.ceil(current.length / 2)
      let firstHalf  = current.slice(0, halfIndex)
      let secondHalf = current.slice(halfIndex)
      stack.push({
        data: secondHalf,
        sorted: false
      })
      stack.push({
        data: firstHalf,
        sorted: false
      })
    }

    counter++
  }

}


let testArray = [2, 3, 5, 4]
splitDeepArrayStack(testArray)
console.log();
