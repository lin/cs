function expect(type) {
  this.eat(type) || throw new SyntaxError('Error');
}

function raise(message) {
  throw new SyntaxError(message);
}


// Test whether a semicolon can be inserted at the current position.

function canInsertSemicolon() {
  return (
    this.match(tt.eof) ||
    this.match(tt.braceR) ||
    this.hasPrecedingLineBreak()
  );
}

function hasPrecedingLineBreak() {
  return lineBreak.test(
    this.input.slice(this.state.lastTokEnd, this.state.start),
  );
}

// TODO

function isLineTerminator() {
  return this.eat(tt.semi) || this.canInsertSemicolon();
}

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

function semicolon() {
  if (!this.isLineTerminator()) this.unexpected(null, tt.semi);
}

function unexpected(pos, messageOrType) {
  if (typeof messageOrType !== "string") {
    messageOrType = `Unexpected token, expected "${messageOrType.label}"`;
  }
  throw this.raise(messageOrType);
}
