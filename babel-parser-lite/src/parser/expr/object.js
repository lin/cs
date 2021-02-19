parseObj (isPattern) {
  const propHash = Object.create(null);
  let first = true;
  const node = this.startNode();

  node.properties = [];
  this.next();

  while (!this.eat(tt.braceR)) {
    if (first) {
      first = false;
    } else {
      this.expect(tt.comma);
      if (this.eat(tt.braceR)) break;
    }
    const prop = this.parseObjectMember(isPattern);
    node.properties.push(prop);
  }

  return this.finishNode(
    node,
    isPattern ? "ObjectPattern" : "ObjectExpression",
  );
}

parseObjectMember(
  isPattern
) {
  let decorators = [];

  const prop = this.startNode();
  let isGenerator = false;
  let isAsync = false;
  let startPos;
  let startLoc;

  prop.method = false;

  this.parsePropertyName(prop);

  this.parseObjPropValue(
    prop,
    startPos,
    startLoc,
    isGenerator,
    isAsync,
    isPattern,
    ,
    containsEsc,
  );

  return prop;
}

parsePropertyName(prop) {
  if (this.eat(tt.bracketL)) {
    prop.computed = true;
    prop.key = this.parseMaybeAssign();
    this.expect(tt.bracketR);
  } else {
    prop.key =
      this.match(tt.num) || this.match(tt.string)
        ? this.parseExprAtom()
        : this.parseIdentifier(true);
  }

  return prop.key;
}


parseObjPropValue(
  prop
) {
  const node =
    this.parseObjectMethod(
      prop,
      isGenerator,
      isAsync,
      isPattern,
      containsEsc,
    ) ||
    this.parseObjectProperty(
      prop,
      startPos,
      startLoc,
      isPattern
    );

  if (!node) this.unexpected();

  // $FlowFixMe
  return node;
}

parseObjectMethod(
  prop
) {
  if (this.match(tt.parenL)) {
    prop.kind = "method";
    prop.method = true;
    return this.parseMethod(
      prop,
      false,
      false,
      "ObjectMethod",
    );
  }
}

parseObjectProperty(
  prop, isPattern
) {
  prop.shorthand = false;

  if (this.eat(tt.colon)) {
    prop.value = isPattern
      ? this.parseMaybeDefault(this.state.start, this.state.startLoc)
      : this.parseMaybeAssign(false, );

    return this.finishNode(prop, "ObjectProperty");
  }

  if (!prop.computed && prop.key.type === "Identifier") {

    if (isPattern) {
      prop.value = this.parseMaybeDefault(
        startPos,
        startLoc,
        prop.key.__clone(),
      );
    } else if (this.match(tt.eq) && ) {
      if (!.start) {
        .start = this.state.start;
      }
      prop.value = this.parseMaybeDefault(
        startPos,
        startLoc,
        prop.key.__clone(),
      );
    } else {
      prop.value = prop.key.__clone();
    }
    prop.shorthand = true;

    return this.finishNode(prop, "ObjectProperty");
  }
}
