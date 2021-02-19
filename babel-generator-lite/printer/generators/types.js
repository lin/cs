const t = require('@babel/types')

module.exports = {

Identifier (node) {
  this.word(node.name);
},

NumericLiteral (node) {
  const value = node.value + "";
  this.number(value);
},

ArgumentPlaceholder() {
  this.token("?");
},

RestElement(node) {
  this.token("...");
  this.print(node.argument, node);
},

SpreadElement(node) {
  RestElement(node)
},

ObjectExpression(node) {
  const props = node.properties;

  this.token("{");

  if (props.length) {
    this.space();
    this.printList(props, node, { indent: true, statement: true });
    this.space();
  }

  this.token("}");
},

ObjectPattern(node) {
  ObjectExpression(node)
},

ObjectMethod(node) {
  this.printJoin(node.decorators, node);
  this._methodHead(node);
  this.space();
  this.print(node.body, node);
},

ObjectProperty(node) {
  this.printJoin(node.decorators, node);

  if (node.computed) {
    this.token("[");
    this.print(node.key, node);
    this.token("]");
  } else {
    // print `({ foo: foo = 5 } = {})` as `({ foo = 5 } = {});`
    if (
      t.isAssignmentPattern(node.value) &&
      t.isIdentifier(node.key) &&
      node.key.name === node.value.left.name
    ) {
      this.print(node.value, node);
      return;
    }

    this.print(node.key, node);

    // shorthand!
    if (
      node.shorthand &&
      (t.isIdentifier(node.key) &&
        t.isIdentifier(node.value) &&
        node.key.name === node.value.name)
    ) {
      return;
    }
  }

  this.token(":");
  this.space();
  this.print(node.value, node);
},

ArrayExpression(node) {
  const elems = node.elements;
  const len = elems.length;

  this.token("[");

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    if (elem) {
      if (i > 0) this.space();
      this.print(elem, node);
      if (i < len - 1) this.token(",");
    } else {
      // If the array expression ends with a hole, that hole
      // will be ignored by the interpreter, but if it ends with
      // two (or more) holes, we need to write out two (or more)
      // commas so that the resulting code is interpreted with
      // both (all) of the holes.
      this.token(",");
    }
  }

  this.token("]");
},

ArrayPattern(node) {
  ArrayExpression(node)
},

RegExpLiteral(node) {
  this.word(`/${node.pattern}/${node.flags}`);
},

BooleanLiteral(node) {
  this.word(node.value ? "true" : "false");
},

NullLiteral() {
  this.word("null");
},

StringLiteral(node) {
  return this.token(node.value);
},

BigIntLiteral(node) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }
  this.token(node.value);
},

PipelineTopicExpression(node) {
  this.print(node.expression, node);
},

PipelineBareFunction(node) {
  this.print(node.callee, node);
},

PipelinePrimaryTopicReference() {
  this.token("#");
},

} // exports end
