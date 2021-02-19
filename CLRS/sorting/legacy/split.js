function splitRecursive (array) {
  if (array.length == 1) {
    return array
  } else {
    let halfIndex  = Math.ceil(array.length / 2)
    let firstHalf  = array.slice(0, halfIndex)
    let secondHalf = array.slice(halfIndex)
    return [splitRecursive(firstHalf), splitRecursive(secondHalf)]
  }
}

function splitIterative (array) {
  let result = array
  let stack = [result]

  while (stack.length) {
    // maybe while loop here later
    let current = stack[stack.length - 1] // reference the result, great!
    stack.pop()

    if (current.length !== 1) {
      let halfIndex  = Math.ceil(current.length / 2)
      let firstHalf  = current.slice(0, halfIndex)
      let secondHalf = current.slice(halfIndex)
      let replace = [firstHalf, secondHalf]
      current[0] = firstHalf
      current[1] = secondHalf
      current.length = 2
      if (secondHalf.length !== 1) stack.push(secondHalf)
      if (firstHalf.length  !== 1) stack.push(firstHalf)
    }
  }

  return result
}

let testArray = [5, 2, 4, 6, 1, 3]
console.dir(splitIterative(testArray), {depth: null, colors: true, maxArrayLength: null});
