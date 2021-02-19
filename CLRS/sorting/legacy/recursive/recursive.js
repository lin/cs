function recursive1 (array) {
  if (array.length == 1) {
    return array
  } else {
    return [
      recursive(array.slice(1))
    ].concat(
      recursive(array.slice(1))
    )
  }
}

function recursive (array) {
  if (array.length == 1) {
    return array
  } else {
    return recursive(array.slice(1))
  }
}

let testArray = [1, 2, 3]
console.dir(recursive(testArray), {depth: null, colors: true, maxArrayLength: null});
