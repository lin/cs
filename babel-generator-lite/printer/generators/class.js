module.exports = {

  ClassDeclaration (node, parent) {

    this.word("class");

    if (node.id) {
      this.space();
      this.print(node.id, node);
    }

    if (node.superClass) {
      this.space();
      this.word("extends");
      this.space();
      this.print(node.superClass, node);
    }

    this.space();
    this.print(node.body, node);
  },

  ClassExpression (node, parent) {
    this.ClassDeclaration(node, parent)
  },

  ClassBody (node) {
    this.token("{");

    if (node.body.length === 0) {
      this.token("}");
    } else {
      this.newline();

      this.indent();
      this.token('test')
      // this.printSequence(node.body, node);
      this.dedent();

      if (!this.endsWith("\n")) this.newline();

      this.rightBrace();
    }
  },

  ClassProperty (node) {

    if (node.static) {
      this.word("static");
      this.space();
    }

    if (node.computed) {
      this.token("[");
      this.print(node.key, node);
      this.token("]");
    } else {
      this.print(node.key, node);
    }

    this.semicolon();
  },

  ClassPrivateProperty (node) {
    if (node.static) {
      this.word("static");
      this.space();
    }

    this.print(node.key, node);

    if (node.value) {
      this.space();
      this.token("=");
      this.space();
      this.print(node.value, node);
    }

    this.semicolon();
  },

  ClassMethod (node) {
    this._classMethodHead(node);
    this.space();
    this.print(node.body, node);
  },

  _classMethodHead (node) {

    if (node.static) {
      this.word("static");
      this.space();
    }

    this._methodHead(node);
  },

  ClassPrivateMethod(node) {
    this._classMethodHead(node);
    this.space();
    this.print(node.body, node);
  },


}
