const tt = require('./types').types
const State = require('./state')

class Tokenizer {
  constructor(input) {
    this.state = new State();
    this.state.init();
    this.input = input;
    this.length = input.length;
    this.isLookahead = false;
  }
}

Object.assign(
  Tokenizer.prototype,
  // next, match, nextToken, finishToken, eat, lookahead
  require('./parts/core'),
  require('./parts/getTokenFromCode'),
  require('./parts/util'),
)

// let a = new Tokenizer('()')
module.exports = Tokenizer
