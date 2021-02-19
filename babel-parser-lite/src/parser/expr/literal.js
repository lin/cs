parseBooleanLiteral() {
  const node = this.startNode();
  node.value = this.match(tt._true);
  this.next();
  return this.finishNode(node, "BooleanLiteral");
}

parseLiteral (
  value,
  type,
  startPos,
  startLoc,
) {
  startPos = startPos || this.state.start;
  startLoc = startLoc || this.state.startLoc;

  const node = this.startNodeAt(startPos, startLoc);
  node.value = value;
  this.next();
  return this.finishNode(node, type);
}
