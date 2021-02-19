// ;
parseEmptyStatement(node){
  this.next();
  return this.finishNode(node, "EmptyStatement");
}

parseExpressionStatement(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
}

// ( expr )
parseHeaderExpression() {
  this.expect(tt.parenL);
  const val = this.parseExpression();
  this.expect(tt.parenR);
  return val;
}

// return / return expr
parseReturnStatement(node) {
  this.next();
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ReturnStatement");
}



parseThrowStatement(node) {
  this.next();
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
}

parseVarStatement(node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
}

// let a = 3, b = 4, c = 5;
parseVar(node, isFor, kind) {
  const declarations = (node.declarations = []);
  node.kind = kind;
  for (;;) {
    const decl = this.startNode();
    decl.id = this.parseBindingAtom();
    if (this.eat(tt.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    }
    declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(tt.comma)) break;
  }
  return node;
}
