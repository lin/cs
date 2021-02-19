const typeRE = /^(int|void|char)(\s*\*)?/
const idRE = /^[_a-zA-Z][_a-zA-Z0-9]{0,30}/
const bodyRE = /^\{((?:.|\n)*)\}/

class Parser {

  constructor (input) {
    this.input = input
    this.state = {}
    this.state.pos = 0
  }

  parse () {
    let node = {}
    node.returnType = this.next().value
    node.functionName = this.next().value
    node.params = this.parseParams()
    node.body = this.next().value
    return node
  }

  current () {
    return this.input[this.state.pos]
  }

  expect (char) {
    this.current() === char ? this.state.pos++ : this.error()
  }

  eat (char) {
    if ( this.current() === char) {
      this.state.pos++
      return true
    } else {
      return false
    }
  }

  error (message = 'Syntax Error') {
    throw new SyntaxError(message)
  }

  next () {
    this.skipSpaces()

    if (this.state.pos > this.input.length) {
      return {type: 'EOF', value: 'EOF'}
    }
    return this.getToken()
  }

  rest () {
    return this.input.substring(this.state.pos)
  }

  skipSpaces () {
    let curr = this.current()
    while ( curr === ' ' || curr === '\n' || curr === '\r' ) {
      this.state.pos++
      curr = this.current()
    }
  }

  getToken () {
    let curr = this.current()
    let rest = this.rest()

    let match

    if ((match = rest.match(typeRE))) {
      this.state.pos += match[0].length
      return {
        type: 'type',
        value: {
          dataType: match[1],
          isPtr: match[2] != null
        }
      }
    }

    if ((match = rest.match(idRE))) {
      this.state.pos += match[0].length
      return {
        type: 'id',
        value: match[0]
      }
    }

    if ((match = rest.match(bodyRE))) {
      this.state.pos += match[0].length
      return {
        type: 'body',
        value: match[1],
      }
    }
  }

  parseParams () {
    this.skipSpaces()

    this.expect('(')

    let params = []

    if (!this.eat(')')) {
      do {
        let param = {}
        param.dataType = this.next().value
        param.id = this.getIdentifier()
        params.push(param)
      } while (this.eat(','))

      this.expect(')')
    }

    return params
  }

  getIdentifier () {
    let token = this.next()

    if (token.type == 'id') {
      return token.value
    } else {
      this.error('Expect Identifier Here')
    }
  }

}

module.exports = Parser
