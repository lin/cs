parseNew() {
  const node = this.startNode();
  node.callee = this.parseNoCallExpr();
  this.parseNewArguments(node);
  return this.finishNode(node, "NewExpression");
}

parseNewArguments(node: N.NewExpression): void {
  if (this.eat(tt.parenL)) {
    const args = this.parseExprList(tt.parenR);
    node.arguments = args;
  } else {
    node.arguments = [];
  }
}
