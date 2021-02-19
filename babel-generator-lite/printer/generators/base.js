module.exports = {

  File (node) {
    this.print(node.program, node)
  },

  Program (node) {
    this.printSequence(node.body, node);
  },

  BlockStatement (node) {
    this.token("{");

    if (node.body.length) {
      this.newline();

      this.printSequence(node.body, node, { indent: true });

      this.removeTrailingNewline();

      if (!this.endsWith("\n")) this.newline();

      this.rightBrace();
    } else {
      this.token("}");
    }
  }

}
