// http://blog.moertel.com/posts/2013-05-11-recursive-to-iterative.html

function factorial1(n) {
  if (n < 2) {
    return 1
  }
  return n * factorial1(n - 1)
}

function factorial2(n, acc = 1) {
  if (n < 2) {
    return 1 * acc
  }
  return factorial2(n - 1, n * acc)
}

function factorial3(n, acc = 1) {
  while (true) {
    if (n < 2) {
      return 1 * acc
    }
    n = n - 1
    acc = acc * n
  }
}

function factorial4(n) {
  let acc = 1 // base result
  while (true) {
    // termination
    if (n < 2) {
      return 1 * acc
    }
    // update
    // accumation is the core of this convert
    acc = acc * n // assuming we have solve the problem
    n = n - 1
  }
}

console.log(factorial4(5));

// clean the code
function factorial5(n) {
  let acc = 1
  while (n > 1) {
    acc *= n
    n -= 1
  }
  return acc
}
