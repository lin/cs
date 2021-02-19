const tt = require('./types').types
const Position = require('../parser/location').Position

// current token's state information
// this is not token, but a lot of information about the token
// lastToken information is also stored in state.
class State {

  constructor() {
    this.type = tt.eof;
    this.start = 0;
    this.end = 0;
    this.lastTokEndLoc = null;
    this.lastTokStartLoc = null;
    this.lastTokStart = 0;
    this.lastTokEnd = 0;
    this.pos = 0
    this.lineStart = 0
    this.curLine = 1
    this.classLevel = 0
    this.strict = false
  }

  init() {
    this.startLoc = this.endLoc = this.curPosition()
  }

  curPosition() {
    return new Position(this.curLine, this.pos - this.lineStart)
  }

  clone(skipArrays) {
    const state = new State()
    const keys = Object.keys(this)
    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i]
      let val = this[key]
      if (!skipArrays && Array.isArray(val)) val = val.slice()
      state[key] = val
    }
    return state
  }
}

module.exports = State
