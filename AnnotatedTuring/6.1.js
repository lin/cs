let max_pointer = 4
let tape = Array(max_pointer + 1).fill('_')
let pointer = max_pointer - 1

function P (symbol){
  tape[pointer] = symbol
}

function E () {
  tape[pointer] = '_'
}

function R () {
  pointer++
}

function L () {
  pointer--
}

function scan (symbol) {
  return tape[pointer] == symbol 
}

//========================//

function begin () {
  if (pointer >= 0) {
    if (scan('_')) {
      P('0')
      increment()
    }
  }
}

function increment () {
  if (pointer >= 0) {
    if (scan('1')) {
      P('0')
      L()
      increment()
    } else if (scan('0')) {
      P('1')
      rewind()
    } else if (scan('_')) {
      P('1')
      rewind()
    }
  }
}

function rewind () {
  if (pointer >= 0) {
    if (scan('_')) {
      L()
      console.log(tape)
      increment()
    } else {
      R()
      rewind()
    }
  }
}

begin()