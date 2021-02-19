// control part of the Tokenizer
function next() {
  // update the state.
  this.state.lastTokEnd = this.state.end;
  this.state.lastTokStart = this.state.start;
  this.state.lastTokEndLoc = this.state.endLoc;
  this.state.lastTokStartLoc = this.state.startLoc;
  this.nextToken();
}

function match(type) {
  return this.state.type === type;
}

function nextToken() {
  this.state.start = this.state.pos;
  this.state.startLoc = this.state.curPosition();
  this.getTokenFromCode(this.input.codePointAt(this.state.pos));
}

function finishToken(type, val) {
  this.state.end = this.state.pos;
  this.state.endLoc = this.state.curPosition();
  const prevType = this.state.type;
  this.state.type = type;
  this.state.value = val;
}

function eat(type) {
  if (this.match(type)) {
    this.next();
    return true;
  } else {
    return false;
  }
}

function lookahead() {
  const old = this.state;
  this.state = old.clone(true);

  this.isLookahead = true;
  this.next();
  this.isLookahead = false;

  const curr = this.state;
  this.state = old;
  return curr;
}

module.exports = {next, eat, match, nextToken, finishToken, lookahead}
