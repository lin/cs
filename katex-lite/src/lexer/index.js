const Token = require("./Token");
const State = require('./State')

const space = "[ \\r\\n\\t]";
const control = "\\\\[a-zA-Z]+"
// const controlSpace = `${control}${space}*`;

const tokenRE = `(${space})|([^\\\\]|${control})`

class Lexer {
    constructor(input) {
        this.input = input;
        this.tokenRegex = new RegExp(tokenRE, 'g');
        this.isLookahead = false
        this.state = new State()
        this.length = input.length
    }

    raise(message) {
      throw new SyntaxError(message)
    }

    consumeSpaces() {
      while (this.state.text === ' ') {
        this.next()
      }
    }

    next() {
      return this.lex()
    }

    eat(char) {
      if (this.state.text === char) {
        this.next()
        return true
      } else {
        return false
      }
    }

    expect(char) {
      if (this.next().text === char) {
        return true
      } else {
        return this.raise('Not what you want!')
      }
    }

    lookahead() {
      const old = this.state
      this.state = old.clone()
      this.isLookahead = true
      this.next()
      this.isLookahead = false
      const current = this.state
      this.state = old
      return current
    }

    lex() {
      if (this.state.endPos + 1 === this.length) {
        return new Token('EOF', this.length)
      }

      const match = this.tokenRegex.exec(this.input)
      match[2] === undefined ? this.state.text = match[1] : this.state.text = match[2]
      this.state.endPos = this.tokenRegex.lastIndex - 1
      return new Token(this.state.text, this.state.endPos)
    }
}


module.exports = Lexer
