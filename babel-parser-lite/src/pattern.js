while (!this.eat(tt.braceR)) {
  if (first) {
    first = false;
  } else {
    this.expect(tt.comma);
    if (this.eat(tt.braceR)) break;
  }

  const node = this.startNode();
  node.id = this.parseIdentifier(true);
  nodes.push(this.finishNode(node, "Identifier"));
}
