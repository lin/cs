parseIfStatement(node) {
  this.next();
  node.test = this.parseHeaderExpression();
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(tt._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
}

parseSwitchStatement(node) {
  this.next();
  node.discriminant = this.parseHeaderExpression();
  const cases = (node.cases = []);
  this.expect(tt.braceL);
  this.state.labels.push(switchLabel);
  this.scope.enter(SCOPE_OTHER);

  let cur;
  while(!this.match(tt.braceR)) {
    if (this.match(tt._case)) {
      // finish the last switch case
      if (cur) this.finishNode(cur, "SwitchCase");
      // start a new switch case
      cases.push((cur = this.startNode()));
      cur.consequent = [];
      this.next();
      cur.test = this.parseExpression()
      this.expect(tt.colon);
    } else {
      if (cur) cur.consequent.push(this.parseStatement(null));
    }
  }

  this.scope.exit();
  if (cur) this.finishNode(cur, "SwitchCase");
  this.next(); // Closing brace
  this.state.labels.pop();

  return this.finishNode(node, "SwitchStatement");
}
