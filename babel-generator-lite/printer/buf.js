module.exports = {

  endsWith (suffix) {
    let lastIndex = this._buf.length - 1
    let last = this._buf[lastIndex]
    if (suffix.length == 1) {
      return suffix === last[last.length - 1]
    }
    let secondToLast
    if (lastIndex - 1 >= 0) secondToLast = this._buf[lastIndex - 1]
    if (last && secondToLast) {
      let end = last + secondToLast
      return suffix === end.slice(-suffix.length)
    }
  },

  removeTrailingNewline() {
    if (this._buf.length > 0 && this._buf[this._buf.length - 1] === "\n") {
      this._buf.pop();
    }
  },

  removeLastSemicolon() {
    if (this._buf.length > 0 && this._buf[this._buf.length - 1] === ";") {
      this._buf.pop();
    }
  },

}
