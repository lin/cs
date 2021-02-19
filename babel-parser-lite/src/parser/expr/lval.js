parseSpread() {
  const node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign();
  if (this.state.commaAfterSpreadAt === -1 && this.match(tt.comma)) {
    this.state.commaAfterSpreadAt = this.state.start;
  }
  return this.finishNode(node, "SpreadElement");
}

parseRestBinding() {
  const node = this.startNode();
  this.next();
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
}

// Parses lvalue (assignable) atom.
parseBindingAtom() {
  switch (this.state.type) {
    case tt.bracketL: {
      const node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(tt.bracketR, true);
      return this.finishNode(node, "ArrayPattern");
    }

    case tt.braceL:
      return this.parseObj(true);
  }

  return this.parseIdentifier();
}

parseBindingList(
  close,
  allowEmpty,
  allowModifiers,
) {
  const elts = [];
  let first = true;
  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(tt.comma);
    }
    if (allowEmpty && this.match(tt.comma)) {
      elts.push(null);
    } else if (this.eat(close)) {
      break;
    } else if (this.match(tt.ellipsis)) {
      elts.push(this.parseRestBinding());
      this.checkCommaAfterRest();
      this.expect(close);
      break;
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts;
}

parseAssignableListItem(
  allowModifiers,
  decorators,
) {
  const left = this.parseMaybeDefault();
  const elt = this.parseMaybeDefault(left.start, left.loc.start, left);
  return elt;
}

parseMaybeDefault(
  startPos,
  startLoc,
  left,
) {
  startLoc = startLoc || this.state.startLoc;
  startPos = startPos || this.state.start;
  left = left || this.parseBindingAtom();
  if (!this.eat(tt.eq)) return left;

  const node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
}
