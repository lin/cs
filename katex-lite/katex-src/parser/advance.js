module.exports = {
  consumeSpaces() {
      while (this.nextToken.text === " ") {
          this.consume();
      }
  },

  consume() {
      this.nextToken = this.gullet.expandNextToken();
  },

  expect(text, consume) {
      if (consume) {
          this.consume();
      }
  },

  switchMode(newMode) {
      this.mode = newMode;
      this.gullet.switchMode(newMode);
  },
}
