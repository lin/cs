const Lexer = require('../lexer')
const Node = require('./Node')

const endOfExpression = ["}", "\\endgroup", "\\end", "\\right", "&"]
const endOfGroup = {
    "[": "]",
    "{": "}",
    "\\begingroup": "\\endgroup",
}
const breakToken = ["]", "}", "\\endgroup", "$", "\\)", "\\cr"]

class Parser extends Lexer {

  startNode(node) {

  }

  parse() {
    let ast = []
    ast = this.parseExpression()
    this.expect('EOF')
    return ast
  }

  parseExpression() {
    let body = []
    while (this.state.endPos + 1 < this.length) {
      body.push(this.parseAtom(brokeToken))
    }

    return body
  }

  parseAtom(brokeToken) {
    const base = this.parseGroup()
  }

  parseGroup() {

  }
}
