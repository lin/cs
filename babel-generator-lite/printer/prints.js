const t = require('@babel/types')

module.exports = {

  print(node, parent) {
    if (!node) return;

    const printMethod = this[node.type];

    this._printStack.push(node);

    try {
      printMethod.call(this, node, parent)
    } catch(err) {
      console.log('NODE TYPE METHOD NOT DEFINED')
      console.log(node.type)
    }

    this._printStack.pop();
  },

  printSequence(nodes, parent, opts = {}) {
    opts.statement = true;

    return this.printJoin(nodes, parent, opts);
  },

  printList(items, parent, opts = {}) {
    if (opts.separator == null) {
      opts.separator = commaSeparator;
    }

    return this.printJoin(items, parent, opts);
  },

  printJoin(nodes, parent, opts = {}) {
    if (!nodes || !nodes.length) return;

    if (opts.indent) this.indent();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (!node) continue;

      if (opts.statement) this.newline()

      this.print(node, parent);

      if (opts.separator && i < nodes.length - 1) {
        opts.separator.call(this);
      }

      if (opts.statement) this.newline()
    }

    if (opts.indent) this.dedent();
  },

  printBlock(parent) {
    const node = parent.body;

    if (!t.isEmptyStatement(node)) {
      this.space();
    }

    this.print(node, parent);
  },

}
