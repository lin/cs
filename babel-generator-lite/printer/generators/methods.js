module.exports = {

  _methodHead(node) {

    const kind = node.kind;
    const key = node.key;

    if (kind === "get" || kind === "set") {
      this.word(kind);
      this.space();
    }

    if (node.async) {
      this.word("async");
      this.space();
    }

    if (kind === "method" || kind === "init") {
      if (node.generator) {
        this.token("*");
      }
    }

    if (node.computed) {
      this.token("[");
      this.print(key, node);
      this.token("]");
    } else {
      this.print(key, node);
    }

    this._params(node);
  },

  _params(node) {

    this.token("(");

    this._parameters(node.params, node);

    this.token(")");

    this.print(node.returnType, node);
  },

  _parameters(parameters, parent) {
    for (let i = 0; i < parameters.length; i++) {
      this._param(parameters[i], parent);

      if (i < parameters.length - 1) {
        this.token(",");
        this.space();
      }
    }
  },

  _param(parameter, parent) {
    this.print(parameter, parent);
  },

  _functionHead(node) {
    if (node.async) {
      this.word("async");
      this.space();
    }
    this.word("function");
    if (node.generator) this.token("*");

    this.space();
    if (node.id) {
      this.print(node.id, node);
    }

    this._params(node);
    this._predicate(node);
  },

  FunctionExpression(node) {
    this._functionHead(node);
    this.space();
    this.print(node.body, node);
  },

  FunctionDeclaration(node) {
    this.FunctionExpression(node)
  },

  ArrowFunctionExpression(node) {
    if (node.async) {
      this.word("async");
      this.space();
    }

    this._params(node);

    this.space();
    this.token("=>");
    this.space();

    this.print(node.body, node);
  },

}
