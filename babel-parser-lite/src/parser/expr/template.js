parseTaggedTemplateExpression(
  startPos,
  startLoc,
  base,
) {
  const node = this.startNodeAt(
    startPos,
    startLoc,
  );
  node.tag = base;
  node.quasi = this.parseTemplate(true);
  return this.finishNode(node, "TaggedTemplateExpression");
}

parseTemplate(isTagged) {
  const node = this.startNode();
  this.next();
  node.expressions = [];
  let curElt = this.parseTemplateElement(isTagged);
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.expect(tt.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(tt.braceR);
    node.quasis.push((curElt = this.parseTemplateElement(isTagged)));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
}

parseTemplateElement(isTagged) {
  const elem = this.startNode();
  elem.value = {
    raw: this.input
      .slice(this.state.start, this.state.end)
      .replace(/\r\n?/g, "\n"),
    cooked: this.state.value,
  };
  this.next();
  elem.tail = this.match(tt.backQuote);
  return this.finishNode(elem, "TemplateElement");
}
