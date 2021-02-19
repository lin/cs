const Tokenizer = require('../tokenizer')

class Parser extends Tokenizer {
  constructor(input) {
    super(input)
    this.input = input
  }
  parse() {
    const file = this.startNode();
    const program = this.startNode();
    this.nextToken();
    return this.parseTopLevel(file, program);
  }
}
