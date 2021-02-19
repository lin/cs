function bubbleSort (array) {
  for (var i = 0; i < array.length; i++) {
    for (var j = array.length - 1; j > i; j--) {
      if (array[j] < array[j - 1]) {
        // swap previous and next
        // a_{i+1} = b_{i}
        // a_{i} = b_{i+1}
        let temp = array[j]
        array[j] = array[j - 1]
        array[j - 1] = temp
      }
    }
  }
  return array
}

// since the solution have mini solution
// that works for any length of the problem
// so we can retrieve the subsolution
// at the same time, we are using the fact that,
// we can use a solution as a known tool to use.
// if we assume we had solved it. then such and such.

// step one: make it toolable
// is the problem solvable by using the same function with same parameters?
// in this way that means you can treat the problem has been solved as a tool
// in your solving procedure.
// step two: use the tool
// (assumption is most of time length related,
// not caring the length of the array)
// by make an assumption of case n, how can it solve case n + 1
// step three: terminate the tool by base case.
// make sure the base case works as well.
function bubbleSortRecursive (array) {
  // this is the base case
  // where the induction terminates
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
    // the logic is here, I have solved one part of the problem
    // which is that if you can solve the n-1 problem, then n size
    // problem is automatically solved by using the assumption.
    // this is like the mathematical induction.
    // by making an assumptioon that if things can be solved for case n
    // we can make it solvable in n + 1 case
    return [array[0]].concat(
      bubbleSortRecursive(array.slice(1))
    )
  }
}

// all recursive function can be implemented using stack
// the stack frame is the ultimate solution
function bubbleSortStack (stack) {
  // at first, the initial params can be stored as the top of the stack
  // and also anything that is computable using the params, i.e. f(params)
  let sortedArray = []

  // the stack has to be empty at the end,
  // so the loop is always check the length of the stack
  while (stack.length) {

    // do sth with the params, stored at the top of the stack
    for (let j = stack.length - 1; j > 0; j--) {
      if (stack[j] < stack[j - 1]) {
        let temp = stack[j]
        stack[j] = stack[j - 1]
        stack[j - 1] = temp
      }
    }

    // after one loop iteration, store a new value in the stack
    // especially the stack should contain the next params needed for the function
    // or next iteration. at the same time.
    // we have to return something, this something will be using the same calculation
    // based on each iteration result. here is the sorted array we care during the
    // recursinve manner.
    // the return value is stored on the stack frame just like the params.
    // so we can say return value is also in the stack params.
    // so, the stack is basically an object that store the state of iteration.
    // for each iteration you can access the top of the state (which is the previous params)
    // at last, you return the value to decrease the stack.
    // at the end, the stack has to be empty, which means the params are fully used.
    // the nature of recursive is to use stack, each time the same type of information
    // is sufficient to do one iteration. to return something is to reduce the stack size.
    sortedArray.push(stack.shift()) // same as: sortedArray.concat(stack.shift())
  }

  return sortedArray
}

console.log(bubbleSort([5, 9, 3, 1, 2, 8, 4, 6, 7]));
console.log(bubbleSortRecursive([5, 9, 3, 1, 2, 8, 4, 6, 7]));
console.log(bubbleSortStack([5, 9, 3, 1, 2, 8, 4, 6, 7]));
