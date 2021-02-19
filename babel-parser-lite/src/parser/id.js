parseIdentifier(liberal): N.Identifier {
  const node = this.startNode();
  const name = this.parseIdentifierName(node.start, liberal);

  return this.createIdentifier(node, name);
}

createIdentifier(node, name) {
  node.name = name;
  node.loc.identifierName = name;

  return this.finishNode(node, "Identifier");
}

parseIdentifierName(pos: number, liberal): string {
  let name: string;

  if (this.match(tt.name)) {
    name = this.state.value;
  } else if (this.state.type.keyword) {
    name = this.state.type.keyword;

    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed
    // as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the
    // context-managing code already ignored the keyword
    if (
      (name === "class" || name === "function") &&
      (this.state.lastTokEnd !== this.state.lastTokStart + 1 ||
        this.input.charCodeAt(this.state.lastTokStart) !== charCodes.dot)
    ) {
      this.state.context.pop();
    }
  } else {
    throw this.unexpected();
  }

  if (!liberal) {
    this.checkReservedWord(
      name,
      this.state.start,
      !!this.state.type.keyword,
      false,
    );
  }

  this.next();

  return name;
}
