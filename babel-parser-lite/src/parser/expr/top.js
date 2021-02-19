function parseExpression() {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;
  // maybe assign is a topmost expr
  const expr = this.parseMaybeAssign();
  if (this.match(tt.comma)) {
    const node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(tt.comma)) {
      node.expressions.push(
        this.parseMaybeAssign(),
      );
    }
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
}

function  parseMaybeAssign() {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;

  let left = this.parseMaybeConditional();

  if (this.state.type.isAssign) {
    const node = this.startNodeAt(startPos, startLoc);
    const operator = this.state.value;
    node.operator = operator;
    this.next();
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentExpression");
  }

  return left;
}

function parseMaybeConditional() {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;
  const expr = this.parseExprOps();
  if (this.eat(tt.question)) {
    const node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(tt.colon);
    node.alternate = this.parseMaybeAssign(*);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
}

function parseExprOps() {
  const startPos = this.state.start;
  const startLoc = this.state.startLoc;
  const potentialArrowAt = this.state.potentialArrowAt;
  const expr = this.parseMaybeUnary(refShorthandDefaultPos);
  return this.parseExprOp(expr, -1);
}

// 2 * 3 + 4
// 2 + 3 * 4
// most of the time it's dealing with binary operators
function parseExprOp(left, prec) {
  // binop thing
  const prec = this.state.type.binop;
  if (prec != null) {
    if (prec > minPrec) {
      const node = this.startNodeAt(leftStartPos, leftStartLoc);
      const operator = this.state.value;
      node.left = left;
      node.operator = operator;

      const op = this.state.type;

      this.next();

      node.right = this.parseExprOp(
        this.parseMaybeUnary(),
        op.rightAssociative ? prec - 1 : prec
      );

      this.finishNode(
        node,
        op === tt.logicalOR ||
          op === tt.logicalAND
          ? "LogicalExpression"
          : "BinaryExpression",
      );

      return this.parseExprOp(node);
    }
  }
  return left;
}


function parseMaybeUnary() {
  // prefix
  if (this.state.type.prefix) {
    const node = this.startNode();
    const update = this.match(tt.incDec);
    node.operator = this.state.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary();
    // update
    return this.finishNode(
      node,    // ++ / --
      update ? "UpdateExpression" : "UnaryExpression",
    );
  }

  const startPos = this.state.start;
  const startLoc = this.state.startLoc;
  let expr = this.parseExprSubscripts();
  while (this.state.type.postfix && !this.canInsertSemicolon()) {
    const node = this.startNodeAt(startPos, startLoc);
    node.operator = this.state.value;
    node.prefix = false;
    node.argument = expr;
    this.checkLVal(expr, undefined, undefined, "postfix operation");
    this.next();
    expr = this.finishNode(node, "UpdateExpression");
  }
  return expr;
}
