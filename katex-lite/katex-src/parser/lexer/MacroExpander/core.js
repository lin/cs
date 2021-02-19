const {Lexer} = require('../Lexer')

module.exports = {
  feed(input) {
      this.lexer = new Lexer(input, this.settings);
  },

  switchMode(newMode) {
      this.mode = newMode;
  },

  beginGroup() {
      this.macros.beginGroup(); // [{}]
  },

  endGroup() {
      this.macros.endGroup();
  },

  future() {
      if (this.stack.length === 0) {
          this.pushToken(this.lexer.lex());
      }
      return this.stack[this.stack.length - 1];
  },

  popToken() {
      this.future();  // ensure non-empty stack
      return this.stack.pop();
  },

  pushToken(token) {
      this.stack.push(token);
  },

  pushTokens(tokens) {
      this.stack.push(...tokens);
  },

  consumeSpaces() {
      for (;;) {
          const token = this.future();
          if (token.text === " ") {
              this.stack.pop();
          } else {
              break;
          }
      }
  },
}
