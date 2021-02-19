
class Lexer {

  constructor (input, visitor) {
    this.input = input
    this.visitor = visitor
    this.length = this.input.length
    this.stack = []
    this.state = {}
    this.state.pos = 0
    this.state.rest = input
    this.state.start = 0
    this.state.end = null
  }

  //======//
  // core //
  //======//

  curr () {
    return this.input[this.state.pos]
  }

  next () {
    return this.input[this.state.pos + 1]
  }

  advance (n = 1) {
    this.state.pos += n
  }

  rest () {
    return this.input.substring(this.state.pos)
  }

  //=========//
  //  regexp //
  //=========//

  find (char, start = 0) {
    let findStartFrom = this.state.pos + start
    let absoluteIndex = this.input.indexOf(char, findStartFrom)

    return absoluteIndex - this.state.pos
  }

  match (regex) {
    return regex.exec(this.input.substring(this.state.pos))
  }

  test (regex) {
    return regex.test(this.input.substring(this.state.pos))
  }

  //==========//
  // visitor //
  //=========//

  contentStart () {
    this.state.start = this.state.pos
  }

  contentEnd () {
    this.state.end = this.state.pos
  }

  visit (type, options) {
    let content = this.input.substring(this.state.start, this.state.end)
    if (this.visitor[type]) {
      this.visitor[type](options, content, this.state.start, this.state.end)
    }
  }

}

module.exports = Lexer
