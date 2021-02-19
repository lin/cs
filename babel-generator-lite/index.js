const Printer = require('./Printer')

class Generator extends Printer {
  constructor (ast) {
    super()
    this.ast = ast
  }

  generate() {
    return super.generate(this.ast);
  }
}

module.exports = function (ast) {
  const gen = new Generator(ast);
  return gen.generate();
}
