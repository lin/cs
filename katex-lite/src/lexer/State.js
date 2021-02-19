class State {
  constructor() {
    this.text = 'EOF'
    this.endPos = 0
  }

  clone() {
    const state = new State()
    const keys = Object.keys(this)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      let val = this[key]
      state[key] = val
    }
    return state
  }
}

module.exports = State;
