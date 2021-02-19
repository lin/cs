parseExprSubscripts(s) {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;
  const expr = this.parseExprAtom();
  return this.parseSubscripts(expr, startPos, startLoc);
}

parseSubscripts(base, startPos, startLoc) {
  do {
    base = this.parseSubscript(
      base,
      startPos,
      startLoc,
      noCalls,
      state,
      maybeAsyncArrow,
    );
  } while (!state.stop);
  return base;
}

parseSubscript(base, startPos, startLoc) {
  if (this.eat(tt.dot)) {
    const node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    node.property = this.parseIdentifier(true);
    node.computed = false;
    return this.finishNode(node, "MemberExpression");
  } else if (this.eat(tt.bracketL)) {
    const node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    node.property = this.parseExpression();
    node.computed = true;
    this.expect(tt.bracketR);
    return this.finishNode(node, "MemberExpression");
  } else if (this.match(tt.parenL)) {
    this.next();
    let node = this.startNodeAt(startPos, startLoc);
    node.callee = base;
    node.arguments = this.parseCallExpressionArguments(tt.parenR);
    return this.finishNode(node, "CallExpression");
  } else {
    state.stop = true;
    return base;
  }
}

parseCallExpressionArguments(close) {
  const elts = [];
  let innerParenStart;
  let first = true;

  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(tt.comma);
    }

    elts.push(
      this.parseExprListItem(
        false,
        possibleAsyncArrow ? { start: 0 } : undefined,
        possibleAsyncArrow ? { start: 0 } : undefined,
        allowPlaceholder,
      ),
    );
  }

  return elts;
}

parseExprList(
  close,
  allowEmpty,
) {
  const elts = [];
  let first = true;

  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(tt.comma);
      if (this.eat(close)) break;
    }

    elts.push(this.parseMaybeAssign());
  }
  return elts;
}
