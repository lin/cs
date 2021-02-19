const SCIENTIFIC_NOTATION = /e/i
const ZERO_DECIMAL_INTEGER = /\.0+$/
const NON_DECIMAL_LITERAL = /^0[box]/

module.exports = {

  // public

  word (str) {
    if (this._endsWithWord || (this.endsWith("/") && str.indexOf("/") === 0)) {
      this._space()
    }

    this._append(str)

    this._endsWithWord = true
  },

  number (str) {
    this.word(str)

    this._endsWithInteger =
      Number.isInteger(+str) &&
      !NON_DECIMAL_LITERAL.test(str) &&
      !SCIENTIFIC_NOTATION.test(str) &&
      !ZERO_DECIMAL_INTEGER.test(str) &&
      str[str.length - 1] !== "."
  },

  token (str) {
    if (
      (str === "--" && this.endsWith("!")) ||
      (str[0] === "+" && this.endsWith("+")) ||
      (str[0] === "-" && this.endsWith("-")) ||
      (str[0] === "." && this._endsWithInteger)
    ) {
      this._space();
    }

    this._append(str);
  },

  space () {
    this._space();
  },

  newline (i = 0) {
    this._newline()
  },

  semicolon() {
    this._append(";");
  },

  rightBrace() {
    this.token("}");
  },

  // indentation

  indent() {
    this._indent++;
  },

  dedent() {
    this._indent--;
  },

  _maybeIndent(str) {
    if (this._indent && this.endsWith("\n") && str[0] !== "\n") {
      this._buf.push(this._getIndent())
    }
  },

  _getIndent() {
    let style = '  '
    let result = ''
    for (let i = 0; i < this._indent; i++) {
      result += style
    }
    return result
  },

  _space () {
    this._append(' ')
  },

  _newline () {
    this._append("\n");
  },

  _append (str) {
    this._maybeIndent(str)

    this._buf.push(str)

    this._endsWithWord = false;
    this._endsWithInteger = false;
  },

}
