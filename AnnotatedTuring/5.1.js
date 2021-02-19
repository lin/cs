let max_pointer = 99
let tape = Array(max_pointer).fill('_')
let pointer = 0

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
  if (pointer < max_pointer) {
    if (scan('_')) {
      P('0')
      begin ()
    } else if (tape[pointer] == '0') {
      R()
      R()
      P('1')
      begin ()
    } else if (tape[pointer] == '1') {
      R()
      R()
      P('0')
      begin ()
    }
  }
}

begin()

console.log(tape)