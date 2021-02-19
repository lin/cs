parseForIn(node, init) {
  const isForIn = this.match(tt._in);
  this.next();

  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(tt.parenR);

  node.body = this.parseStatement("for"),

  this.scope.exit();
  this.state.labels.pop();

  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
}

parseFor(node, init) {
  node.init = init;
  this.expect(tt.semi);
  node.test = this.match(tt.semi) ? null : this.parseExpression();
  this.expect(tt.semi);
  node.update = this.match(tt.parenR) ? null : this.parseExpression();
  this.expect(tt.parenR);

  node.body = this.parseStatement("for")
  this.scope.exit();
  this.state.labels.pop();

  return this.finishNode(node, "ForStatement");
}

parseWhileStatement(node) {
  this.next();
  node.test = this.parseHeaderExpression();
  this.state.labels.push(loopLabel);
  node.body = this.parseStatement("while")
  this.state.labels.pop();
  return this.finishNode(node, "WhileStatement");
}

parseForStatement(node: N.Node): N.ForLike {
  this.next();
  this.state.labels.push(loopLabel);
  this.scope.enter(SCOPE_OTHER);
  this.expect(tt.parenL);

  if (this.match(tt.semi)) {
    return this.parseFor(node, null);
  }

  const isLet = this.isLet();

  if (this.match(tt._var) || this.match(tt._const) || isLet) {
    const init = this.startNode();
    const kind = isLet ? "let" : this.state.value;
    this.next();
    this.parseVar(init, true, kind);
    this.finishNode(init, "VariableDeclaration");
    return this.parseFor(node, init);
  }
}

// do { statement } while
parseDoStatement(node) {
  this.next();
  this.state.labels.push(loopLabel);
  node.body = this.parseStatement("do"),
  this.state.labels.pop();
  this.expect(tt._while);
  node.test = this.parseHeaderExpression();
  this.eat(tt.semi);
  return this.finishNode(node, "DoWhileStatement");
}
