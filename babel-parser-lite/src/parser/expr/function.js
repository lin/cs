parseMethod (node) {
  this.initFunction(node, isAsync);
  this.parseFunctionParams(node);
  this.parseFunctionBodyAndFinish(node, type, true);
  return node;
}

parseFunctionBodyAndFinish(
  node,
  type,
  isMethod = false,
): void {
  // $FlowIgnore (node is not bodiless if we get here)
  node.body = this.parseBlock(true, false);
  this.finishNode(node, type);
}
