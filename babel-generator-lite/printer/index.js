const isInteger = require("lodash/isInteger")
const repeat = require("lodash/repeat")

class Printer {
  constructor () {
    this._printStack = []
    this._indent = 0
    this._buf = []
    this._endsWithInteger = false;
    this._endsWithWord = false;
  }

  generate (ast) {
    this.print(ast)
    return this._buf.join('')
  }

}

Object.assign(
  Printer.prototype,
  require("./core"),
  require("./prints"),
  require("./buf"),
  require("./generators"),
);

function commaSeparator() {
  this.token(",");
  this.space();
}

module.exports = Printer
