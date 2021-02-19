function splitDeepArray (array) {
  if (array.length == 1) {
    return array
  } else {
    let halfIndex  = Math.ceil(array.length / 2)
    let firstHalf  = array.slice(0, halfIndex)
    let secondHalf = array.slice(halfIndex)
    return [splitDeepArray(firstHalf), splitDeepArray(secondHalf)]
  }
}

function splitDeepArrayHeuristic (array) {
  if (array.length == 1) {
    return array
  } else {
    let halfIndex  = Math.ceil(array.length / 2)
    let firstHalf  = array.slice(0, halfIndex)
    let secondHalf = array.slice(halfIndex)

    // return [splitDeepArray(firstHalf), splitDeepArray(secondHalf)]

    result = [result1, result2]
    array1 = firstHalf
    array2 = secondHalf
  }
}

function split (array1, array2) {
  if (array1.length == 1 && array2.length == 1) {
    return [array1, array2]
  } else {
    let halfIndex  = Math.ceil(array.length / 2)
    let firstHalf  = array.slice(0, halfIndex)
    let secondHalf = array.slice(halfIndex)
    return [split(firstHalf), split(secondHalf)]
  }
}

function splitDeepArrayStack (array) {
  let result = []
  let depth = 0
  let stack = [{
    data: array,
    depth
  }]

  // put array on the waiting list
  while (stack.length) {
    // invite the next inline customer
    let top = stack.pop()

    let halfIndex  = Math.ceil(top.length / 2)
    let firstHalf  = top.slice(0, halfIndex)
    let secondHalf = top.slice(halfIndex)

    // let's solve some common situations first
    if (firstHalf.length !== 1 || secondHalf.length !== 1) {
      depth++
      stack.push({
        data: firstHalf,
        depth
      })
      stack.push({
        data: secondHalf,
        depth
      })
    } else {
      result([firstHalf, secondHalf])
    }
  }
  return result
}

let testArray = [5, 2, 4, 6, 1, 3]
console.dir(splitFirst(testArray), {depth: null, colors: true, maxArrayLength: null});
// function splitDeepArrayStack (array) {
//   let result = []
//   let queue = [array]
//
//   while (queue.length) {
//     if (queue[0].length != 1) {
//       let halfIndex  = Math.ceil(queue[0].length / 2)
//       let firstHalf  = queue[0].slice(0, halfIndex)
//       let secondHalf = queue[0].slice(halfIndex)
//       if (firstHalf.length == 1) {
//         result.push(firstHalf)
//       } else if (secondHalf.length == 1) {
//
//       }
//       firstHalf.length == 1 ? result.push(firstHalf) : queue.push(firstHalf)
//       secondHalf.length == 1 ? result.push(secondHalf) : queue.push(secondHalf)
//     }
//     queue.shift()
//   }
//
//   console.log(result)
//
//   return array
// }
