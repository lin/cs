function bubbleSort (array) {
  for (var i = 0; i < array.length; i++) {
    for (var j = array.length - 1; j > i; j--) {
      if (array[j] < array[j - 1]) {
        let temp = array[j]
        array[j] = array[j - 1]
        array[j - 1] = temp
      }
    }
  }
  return array
}

function bubbleSortRecursive (array) {
  if (array.length == 1) {
    return array
  } else {
    for (var j = array.length - 1; j > 0; j--) {
      if (array[j] < array[j - 1]) {
        let temp = array[j]
        array[j] = array[j - 1]
        array[j - 1] = temp
      }
    }
    return [array[0]].concat(
      bubbleSortRecursive(array.slice(1))
    )
  }
}

function bubbleSortStack (stack) {
  let sortedArray = []

  while (stack.length) {
    for (let j = stack.length - 1; j > 0; j--) {
      if (stack[j] < stack[j - 1]) {
        let temp = stack[j]
        stack[j] = stack[j - 1]
        stack[j - 1] = temp
      }
    }
    sortedArray.push(stack.shift())
  }

  return sortedArray
}
