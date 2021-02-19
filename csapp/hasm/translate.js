
// the grammar:

// START -> $num | num | regiser | (COMPUTE) | num(COMPUTE)
// COMPUTE -> register
//          | register, register
//          | , register, s
//          | register, register, s

let registers = ['R8', 'R9', 'R10']
let registerCursor = 0

function allocRegister () {
  return registers[registerCursor++]
}

function deallocRegister () {
  if (registerCursor > 0) registerCursor--
}


function translate (tokens) {

  console.log(tokens);

  let cursor = 0
  let output = []

  let current = tokens[cursor]
  let lookahead = tokens[cursor + 1]

  // START -> $num | num | regiser | (COMPUTE) | num(COMPUTE)
  switch (current.type) {
    case '$':
      let intValue = parseInt(tokens[cursor + 1].value)
      return output.push(
        `@${intValue}\n
        D=A\n
        @${allocRegister()}\n
        M=D`
      )
      break;
    case 'register':
      return 'register.' + current.value
      break;
    case 'number':
      if (!lookahead) {
        return 'memory[' + current.value + ']'
      }
      return parseParen(current.value)
      break;
    case '(':
      return parseParen()
      break;
    default:
      error()
  }

  // COMPUTE -> register
  //          | register, register
  //          | , register, s
  //          | register, register, s
  //
  // so we need to LL(2) parser
  // because of the nature of the grammar

  function parseParen(number = false) {

    let out = 'memory['

    if (number) {
      out += number + ' + '
      eat('number')
    }

    advance()

    switch (current.type) {

      case 'register':

        let register1 = current.value;

        if (lookahead.type === ')') {

          return out + `register.${register1}]`

        } else if (lookahead.type === ',') {

          advance()
          eat(',')

          let register2 = current.value

          out += `register.${register1} + register.${register2}`

          advance()

          if (current.type === ')') {

            return out + `]`

          } else {

            eat(',')
            advance()

            let s = current.value

            return out + ` * ${s}]`
          }
        }

        break;
      case ',':

        let s = tokens[cursor + 3].value

        out += `register.${lookahead.value} * ${s}]`

        return out
      default:
        error()
    }
  }

  // function is not always pure.
  // since function can be treated as
  // a way to reduce repeatation
  // but pure function has its merit
  // it works like a black box or even magic
  // you only cares the interface not things under the hood
  function advance (i = 1) {
    cursor += i
    current = tokens[cursor]
    lookahead = tokens[cursor + 1]
  }

  function eat(char) {
    current.type ===  char ? advance() : error()
  }

  function error () {
    throw new SyntaxError('Illigelly Defined Input')
  }

}

module.exports = translate
