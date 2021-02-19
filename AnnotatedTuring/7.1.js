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

function safe () {
  return pointer < max_pointer
}

function A () {
  console.log('Airs! Function A is called!');
}

function B () {
  console.log('Beers! Function B is called!');
}

function C () {
  console.log('Cheers! Function C is called!');
}

function D () {
  console.log('Deers! Function D is called!');
}

function EE () {
  console.log('Ears! Function E is called!');
}

//========================//

// find
function f (C, B, a) {
  if (safe()) {
    if (scan('e')) {
      L()
      f1(C, B, a)
    } else {
      L()
      f(C, B, a)
    }
  }
}

function f1 (C, B, a) {
  if (safe()) {
    if (scan(a)) {
      C()
    } else if (!scan('_')){
      R()
      f1(C, B, a)
    } else if (scan('_')) {
      R()
      f2(C, B, a)
    }
  }
}

function f2 (C, B, a) {
  if (safe()) {
    if (scan(a)) {
      C()
    } else if (!scan('_')){
      R()
      f1(C, B, a)
    } else if (scan('_')) {
      R()
      B()
    }
  }
}

// erase
function e (C, B, a) {
  if (safe()) {
    if (arguments.length == 3) {
      f(() => e1(C, B, a), B, a)
    } else if (arguments.length == 2) {
      e(() => e(C, B), C, B)
    } else if (arguments.length == 1) {
      if (scan('e')) {
        R()
        e1(C)
      } else {
        L()
        e(C)
      }
    }
  }
}

function e1 (C, B, a) {
  if (safe()) {
    if (arguments.length == 3) {
      E()
      C()
    } else if (arguments.length == 1) {
      if (scan('e')) {
        C()
      } else {
        R()
        E()
        R()
        e1(C)
      }
    }
  }
}

// tape = 'eea1a0_0a1____'.split('')
// e(B, 'a')

// print at end
function pe (C, b) {
  if (safe()) {
    f(() => pe1(C, b), C, 'e')
  }
}

function pe1 (C, b) {
  if (safe()) {
    if (scan('_')) {
      P(b)
      C()
    } else {
      R()
      R()
      pe1(C, b)
    }
  }
}

// tape = 'ee1a0_0a1______'.split('')
// pe(C, '1')
// pe(C, '0')

// move
function l (C) {
  if (safe()) {
    L()
    C()
  }
}

function r (C) {
  if (safe()) {
    R()
    C()
  }
}

function fl (C, B, a) {
  if (safe()) {
    f(() => l(C), B, a)
  }
}

function fr (C, B, a) {
  if (safe()) {
    f(() => r(C), B, a)
  }
}

function c (C, B, a) {
  if (safe()) {
    fl(() => c1(C), B, a)
  }
}

function c1 (C) {
  if (safe()) {
    pe(C, tape[pointer])
  }
}

// tape = 'ee1a0b0c1_______'.split('')
// c(C, B, 'a')
// c(C, B, 'b')
// c(C, B, 'c')

function ce (C, B, a) {
  if (safe()) {
    if (arguments.length == 3) {
      c(() => e(C, B, a), B, a)
    } else if (arguments.length == 2) {
      ce(() => ce(C, B), C, B)
    }
  }
}

// tape = 'ee1a0b0a1_______'.split('')
// ce(C, 'a')

function re (C, B, a, b) {
  if (safe()) {
    if (arguments.length == 4) {
      f(() => re1(C, B, a, b), B, a)
    } else if (arguments.length == 3) {
      re(() => re(C, B, a), C, B, a)
    }
  }
}

function re1 (C, B, a, b) {
  if (safe()) {
    E()
    P(b)
    C()
  }
}

// tape = 'ee1a0b0a1_______'.split('')
// re(B, 'a', 'd')

// function cr (C, B, a) {
//   if (safe()) {
//     if (arguments.length == 3) {
//       c(() => re(C, B, a, a), B, a)
//     } else if (arguments.length == 2) {
//       cr(() => cr(C, B), () => re(C, B, B), B)
//     }
//   }
// }

// tape = 'ee1a0b0_1___________'.split('')
// cr(C, 'a')

function cp (C, A, E, a, b) {
  if (safe()) {
    fl(() => cp1(C, A, b), () => f(A, E, b), a)
  }
}

function cp1 (C, A, b) {
  if (safe()) {
    g = tape[pointer]
    fl(() => cp2(C, A, g), A, b)
  }
}

function cp2 (C, A, g) {
  if (safe()) {
    if (scan(g)) {
      C()
    } else {
      A()
    }
  }
}

// tape = 'ee1a0b0_1___________'.split('')
// cp(C, A, E, 'a', 'b')

// tape = 'ee1a1b0_1___________'.split('')
// cp(C, A, E, 'a', 'b')

// tape = 'ee1a1c0_1___________'.split('')
// cp(C, A, E, 'a', 'b')

// tape = 'ee1d1c0_1___________'.split('')
// cp(C, A, E, 'a', 'b')

function cpe (C, A, E, a, b) {
  if (safe()) {
    if (arguments.length == 5) {
      cp(() => e(() => e(C, C, b), C, a), A, E, a, b)
    } else if (arguments.length == 4) {
      cpe(() => cpe(C, A, E, a), C, A, E, a)
    }
  }
}

// tape = 'ee1a1b0a1b__________'.split('')
// cpe(A, EE, 'a', 'b')

function g(C, a) {
  if (safe()) {
    if (arguments.length == 1) {
      if (scan('_')) {
        R()
        g1(C)
      } else {
        R()
        g(C)
      }
    } else if (arguments.length == 2) {
      g(() => g1(C, a))
    }
  }
}

function g1(C, a) {
  if (safe()) {
    if (arguments.length == 1) {
      if (scan('_')) {
        C()
      } else {
        R()
        g(C)
      }
    } else if (arguments.length == 2) {
      if (scan(a)) {
        C()
      } else {
        L()
        g1(C, a)
      }
    }
  }
}

// tape = 'ee1a1b0a1b__________'.split('')
// g(C, 'a')
// g(C, 'b')
// console.log(pointer)

function pe2 (C, a, b) {
  if (safe()) {
    pe(() => pe(C, b), a)
  }
}

function ce2 (B, a, b) {
  if (safe()) {
    ce(() => ce(B, b), a)
  }
}

function ce3 (B, a, b, g) {
  if (safe()) {
    ce(() => ce2(B, b, g), a)
  }
}



console.log(tape)