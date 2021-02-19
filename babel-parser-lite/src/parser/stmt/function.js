function parseFunctionStatement(node) {
  this.next();
  return this.parseFunction(node);
}

function parseFunction(node, isStatement) {
  this.initFunction(node, isAsync);
  node.id = this.parseIdentifier()
  this.parseFunctionParams(node);
  this.parseFunctionBodyAndFinish( node,
    isStatement ? "FunctionDeclaration" : "FunctionExpression",
  );
  return node;
}

function parseFunctionParams(node) {
  // state.inParameters = true
  this.expect(tt.parenL);
  node.params = this.parseBindingList(tt.parenR, false, allowModifiers);
}
