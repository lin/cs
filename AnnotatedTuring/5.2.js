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
    P('e')
    R()
    P('0')
    print_new_one()
  }
}

function print_new_one () {
  if (pointer < max_pointer) {
    if (scan('_')) {
      P('1')
      L()
      print_marked_ones()
    } else {
      R()
      R()
      print_new_one()
    }
  }
}

function print_marked_ones () {
  if (pointer < max_pointer) {
    if (scan('_')) {
      L()
      L()
      print_marked_ones()
    } else if (scan('e')) {
      R()
      print_new_zero()
    } else if (scan('x')) {
      E()
      R()
      print_new_one()
    } else {
      throw Error('Not possible')
    }
  }
}

function print_new_zero () {
  if (pointer < max_pointer) {
    if (scan('_')) {
      P('0')
      L()
      L()
      mark_recent_ones()
    } else {
      R()
      R()
      print_new_zero()
    }
  }
}

function mark_recent_ones () {
  if (pointer < max_pointer) {
    if (scan('1')) {
      L()
      P('x')
      L()
      mark_recent_ones()
    } else if (scan('0')) {
      print_new_one()
    }
  }
}

begin()

console.log(tape)