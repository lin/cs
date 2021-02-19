let max_pointer = 91
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
    P('@')
    R()
    P('1')
    R()
    R()
    P('0')
    R()
    R()
    P('1')
    R()
    R()
    P('1')
    new_digit()
  }
}

function new_digit () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      mark_digits()
    } else {
      L()
      new_digit()
    }
  }
}

function mark_digits () {
  if (pointer < max_pointer) {
    if (scan('1')) {
      R()
      P('x')
      R()
      mark_digits()
    } else if (scan('0')) {
      R()
      P('x')
      R()
      mark_digits()
    } else if (scan('_')) {
      R()
      P('z')
      R()
      R()
      P('r')
      find_x()
    }
  }
}

function find_x () {
  if (pointer < max_pointer) {
    if (scan('x')) {
      E()
      first_r()
    } else if (scan('@')) {
      find_digits()
    } else {
      L()
      L()
      find_x()
    }
  }
}

function first_r () {
  if (pointer < max_pointer) {
    if (scan('r')) {
      R()
      R()
      last_r()
    } else {
      R()
      R()
      first_r()
    }
  }
}

function last_r () {
  if (pointer < max_pointer) {
    if (scan('r')) {
      R()
      R()
      last_r()
    } else if (scan('_')) {
      P('r')
      R()
      R()
      P('r')
      find_x()
    }
  }
}

function find_digits () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      R()
      find_first_digit()
    } else {
      L()
      L()
      find_digits() 
    }
  }
}

function find_first_digit () {
  if (pointer < max_pointer) {
    if (scan('x')) {
      L()
      found_first_digit()
    } else if (scan('y')) {
      L()
      found_first_digit()
    } else if (scan('z')) {
      L()
      found_second_digit()
    } else if (scan('_')) {
      R()
      R()
      find_first_digit ()
    }
  }
}

function found_first_digit () {
  if (pointer < max_pointer) {
    if (scan('0')) {
      R()
      add_zero()
    } else if (scan('1')) {
      R()
      R()
      R()
      find_second_digit()
    }
  }
}

function find_second_digit () {
  if (pointer < max_pointer) {
    if (scan('x')) {
      L()
      found_second_digit()
    } else if (scan('y')) {
      L()
      found_second_digit()
    } else if (scan('_')) {
      R()
      R()
      find_second_digit ()
    }
  }
}

function found_second_digit () {
  if (pointer < max_pointer) {
    if (scan('0')) {
      R()
      add_zero()
    } else if (scan('1')) {
      R()
      add_one()
    } else if (scan('_')) {
      R()
      add_one()
    }
  }
}

function add_zero () {
  if (pointer < max_pointer) {
    if (scan('r')) {
      P('s')
      add_finished()
    } else if (scan('u')) {
      P('v')
      add_finished()
    } else {
      R()
      R()
      add_zero()
    }
  }
}

function add_one () {
  if (pointer < max_pointer) {
    if (scan('r')) {
      P('v')
      add_finished()
    } else if (scan('u')) {
      P('s')
      R()
      R()
      carry()
    } else {
      R()
      R()
      add_one()
    }
  }
}

function carry () {
  if (pointer < max_pointer) {
    if (scan('r')) {
      P('u')
      add_finished()
    } else if (scan('u')) {
      P('r')
      R()
      R()
      carry()
    } else if (scan('_')) {
      P('u')
      new_digit_is_zero()
    }
  }
}

function add_finished () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      R()
      erase_old_x()
    } else {
      L()
      L()
      add_finished()
    }
  }
}

function erase_old_x () {
  if (pointer < max_pointer) {
    if (scan('x')) {
      E()
      L()
      L()
      print_new_x()
    } else if (scan('z')) {
      P('y')
      L()
      L()
      print_new_x()
    } else {
      R()
      R()
      erase_old_x()
    }
  }
}

function print_new_x () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      R()
      erase_old_y()
    } else if (scan('y')) {
      P('z')
      find_digits()
    } else if (scan('_')) {
      P('x')
      find_digits()
    }
  }
}

function erase_old_y () {
  if (pointer < max_pointer) {
    if (scan('y')) {
      E()
      L()
      L()
      print_new_y()
    } else {
      R()
      R()
      erase_old_y()
    }
  }
}

function print_new_y () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      new_digit_is_one()
    } else {
      P('y')
      R()
      reset_new_x()
    }
  }
}

function reset_new_x () {
  if (pointer < max_pointer) {
    if (scan('_')) {
      R()
      P('x')
      flag_result_digits()
    } else {
      R()
      R()
      reset_new_x()
    }
  }
}

function flag_result_digits () {
  if (pointer < max_pointer) {
    if (scan('s')) {
      P('t')
      R()
      R()
      unflag_result_digits()
    } else if (scan('v')) {
      P('w')
      R()
      R()
      unflag_result_digits()
    } else {
      R()
      R()
      flag_result_digits()
    }
  }
}

function unflag_result_digits () {
  if (pointer < max_pointer) {
    if (scan('s')) {
      P('r')
      R()
      R()
      unflag_result_digits()
    } else if (scan('v')) {
      P('u')
      R()
      R()
      unflag_result_digits()
    } else {
      find_digits()
    }
  }
}

function new_digit_is_zero () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      print_zero_digit()
    } else {
      L()
      new_digit_is_zero()
    }
  }
}

function print_zero_digit () {
  if (pointer < max_pointer) {
    if (scan('0')) {
      R()
      E()
      R()
      print_zero_digit()
    } else if (scan('1')) {
      R()
      E()
      R()
      print_zero_digit()
    } else if (scan('_')) {
      P('0')
      R()
      R()
      R()
      cleanup()
    }
  }
}

function new_digit_is_one () {
  if (pointer < max_pointer) {
    if (scan('@')) {
      R()
      print_one_digit()
    } else {
      L()
      new_digit_is_one()
    }
  }
}

function print_one_digit () {
  if (pointer < max_pointer) {
    if (scan('0')) {
      R()
      E()
      R()
      print_one_digit()
    } else if (scan('1')) {
      R()
      E()
      R()
      print_one_digit()
    } else if (scan('_')) {
      P('1')
      R()
      R()
      R()
      cleanup()
    }
  }
}

function cleanup () {
  if (pointer < max_pointer) {
    if (scan('_')) {
      new_digit()
    } else {
      E()
      R()
      R()
      cleanup()
    }
  }
}

begin()

console.log(tape)