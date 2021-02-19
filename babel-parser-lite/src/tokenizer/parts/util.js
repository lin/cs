function canInsertSemicolon() {
  return (
    this.match(tt.eof) ||
    this.match(tt.braceR) ||
    this.hasPrecedingLineBreak()
  );
}

function hasPrecedingLineBreak() {
  return /\r\n?|[\n\u2028\u2029]/.test(
    this.input.slice(this.state.lastTokEnd, this.state.start),
  );
}

module.exports = {canInsertSemicolon, hasPrecedingLineBreak}
