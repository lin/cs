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

function mergeSort(array) {
  let splitedArray = array
  let mainStack = [splitedArray]
  let stackLeft = []
  let stackRight = []

  let loopCounter = 0

  while (mainStack.length && loopCounter < 5) {
    let current = mainStack[stack.length - 1]
    mainStack.pop()

    if (current.length !== 1) {
      let halfIndex  = Math.ceil(current.length / 2)
      let firstHalf  = current.slice(0, halfIndex)
      let secondHalf = current.slice(halfIndex)

      stackLeft.push(firstHalf)
      stackRight.push(secondHalf)
    }

    loopCounter++
  }
}
