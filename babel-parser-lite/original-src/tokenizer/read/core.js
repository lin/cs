readToken_dot(): void {
  const next = this.input.charCodeAt(this.state.pos + 1);
  if (next >= charCodes.digit0 && next <= charCodes.digit9) {
    this.readNumber(true);
    return;
  }

  const next2 = this.input.charCodeAt(this.state.pos + 2);
  if (next === charCodes.dot && next2 === charCodes.dot) {
    this.state.pos += 3;
    this.finishToken(tt.ellipsis);
  } else {
    ++this.state.pos;
    this.finishToken(tt.dot);
  }
}
