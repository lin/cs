// @flow

export default class StatementParser extends ExpressionParser {
  // ### Statement parsing

  parseForStatement(node: N.Node): N.ForLike {
    this.next();
    this.state.labels.push(loopLabel);

    this.scope.enter(SCOPE_OTHER);
    this.expect(tt.parenL);

    if (this.match(tt.semi)) {
      return this.parseFor(node, null);
    }

    const isLet = this.isLet();
    if (this.match(tt._var) || this.match(tt._const) || isLet) {
      const init = this.startNode();
      const kind = isLet ? "let" : this.state.value;
      this.next();
      this.parseVar(init, true, kind);
      this.finishNode(init, "VariableDeclaration");

      if (
        (this.match(tt._in) || this.isContextual("of")) &&
        init.declarations.length === 1
      ) {
        return this.parseForIn(node, init, awaitAt);
      }
      return this.parseFor(node, init);
    }

    const refShorthandDefaultPos = { start: 0 };
    const init = this.parseExpression(true, refShorthandDefaultPos);
    if (this.match(tt._in) || this.isContextual("of")) {
      const description = this.isContextual("of")
        ? "for-of statement"
        : "for-in statement";
      this.toAssignable(init, undefined, description);
      this.checkLVal(init, undefined, undefined, description);
      return this.parseForIn(node, init, awaitAt);
    } else if (refShorthandDefaultPos.start) {
      this.unexpected(refShorthandDefaultPos.start);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  }

  parseVarStatement(
    node: N.VariableDeclaration,
    kind: "var" | "let" | "const",
  ): N.VariableDeclaration {
    this.next();
    this.parseVar(node, false, kind);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  }

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  parseFor(
    node: N.ForStatement,
    init: ?(N.VariableDeclaration | N.Expression),
  ): N.ForStatement {
    node.init = init;
    this.expect(tt.semi);
    node.test = this.match(tt.semi) ? null : this.parseExpression();
    this.expect(tt.semi);
    node.update = this.match(tt.parenR) ? null : this.parseExpression();
    this.expect(tt.parenR);

    node.body =
      // For the smartPipelines plugin: Disable topic references from outer
      // contexts within the loop body. They are permitted in test expressions,
      // outside of the loop body.
      this.withTopicForbiddingContext(() =>
        // Parse the loop body.
        this.parseStatement("for"),
      );

    this.scope.exit();
    this.state.labels.pop();

    return this.finishNode(node, "ForStatement");
  }

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  parseForIn(
    node: N.ForInOf,
    init: N.VariableDeclaration | N.AssignmentPattern,
    awaitAt: number,
  ): N.ForInOf {
    const isForIn = this.match(tt._in);
    this.next();

    if (isForIn) {
      if (awaitAt > -1) this.unexpected(awaitAt);
    } else {
      node.await = awaitAt > -1;
    }

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (!isForIn ||
        this.state.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier")
    ) {
      this.raise(
        init.start,
        `${
          isForIn ? "for-in" : "for-of"
        } loop variable declaration may not have an initializer`,
      );
    } else if (init.type === "AssignmentPattern") {
      this.raise(init.start, "Invalid left-hand side in for-loop");
    }

    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(tt.parenR);

    node.body =
      // For the smartPipelines plugin:
      // Disable topic references from outer contexts within the loop body.
      // They are permitted in test expressions, outside of the loop body.
      this.withTopicForbiddingContext(() =>
        // Parse loop body.
        this.parseStatement("for"),
      );

    this.scope.exit();
    this.state.labels.pop();

    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
  }

  // Parse a list of variable declarations.

  parseVar(
    node: N.VariableDeclaration,
    isFor: boolean,
    kind: "var" | "let" | "const",
  ): N.VariableDeclaration {
    const declarations = (node.declarations = []);
    const isTypescript = this.hasPlugin("typescript");
    node.kind = kind;
    for (;;) {
      const decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(tt.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else {
        if (
          kind === "const" &&
          !(this.match(tt._in) || this.isContextual("of"))
        ) {
          // `const` with no initializer is allowed in TypeScript.
          // It could be a declaration like `const x: number;`.
          if (!isTypescript) {
            this.unexpected();
          }
        } else if (
          decl.id.type !== "Identifier" &&
          !(isFor && (this.match(tt._in) || this.isContextual("of")))
        ) {
          this.raise(
            this.state.lastTokEnd,
            "Complex binding patterns require an initialization value",
          );
        }
        decl.init = null;
      }
      declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(tt.comma)) break;
    }
    return node;
  }

  parseVarId(decl: N.VariableDeclarator, kind: "var" | "let" | "const"): void {
    if ((kind === "const" || kind === "let") && this.isContextual("let")) {
      this.unexpected(null, "let is disallowed as a lexically bound name");
    }
    decl.id = this.parseBindingAtom();
    this.checkLVal(
      decl.id,
      kind === "var" ? BIND_VAR : BIND_LEXICAL,
      undefined,
      "variable declaration",
    );
  }

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  parseFunction<T: N.NormalFunction>(
    node: T,
    statement?: number = FUNC_NO_FLAGS,
    isAsync?: boolean = false,
  ): T {
    const isStatement = statement & FUNC_STATEMENT;
    const isHangingStatement = statement & FUNC_HANGING_STATEMENT;
    const requireId = !!isStatement && !(statement & FUNC_NULLABLE_ID);

    this.initFunction(node, isAsync);

    if (this.match(tt.star) && isHangingStatement) {
      this.unexpected(
        this.state.start,
        "Generators can only be declared at the top level or inside a block",
      );
    }
    node.generator = this.eat(tt.star);

    if (isStatement) {
      node.id = this.parseFunctionId(requireId);
    }

    const oldInClassProperty = this.state.inClassProperty;
    const oldYieldPos = this.state.yieldPos;
    const oldAwaitPos = this.state.awaitPos;
    this.state.inClassProperty = false;
    this.state.yieldPos = 0;
    this.state.awaitPos = 0;
    this.scope.enter(functionFlags(node.async, node.generator));

    if (!isStatement) {
      node.id = this.parseFunctionId();
    }

    this.parseFunctionParams(node);

    // For the smartPipelines plugin: Disable topic references from outer
    // contexts within the function body. They are permitted in test
    // expressions, outside of the function body.
    this.withTopicForbiddingContext(() => {
      // Parse the function body.
      this.parseFunctionBodyAndFinish(
        node,
        isStatement ? "FunctionDeclaration" : "FunctionExpression",
      );
    });

    this.scope.exit();

    if (isStatement && !isHangingStatement) {
      // We need to validate this _after_ parsing the function body
      // because of TypeScript body-less function declarations,
      // which shouldn't be added to the scope.
      this.checkFunctionStatementId(node);
    }

    this.state.inClassProperty = oldInClassProperty;
    this.state.yieldPos = oldYieldPos;
    this.state.awaitPos = oldAwaitPos;

    return node;
  }

  parseFunctionId(requireId?: boolean): ?N.Identifier {
    return requireId || this.match(tt.name) ? this.parseIdentifier() : null;
  }

  parseFunctionParams(node: N.Function, allowModifiers?: boolean): void {
    const oldInParameters = this.state.inParameters;
    this.state.inParameters = true;

    this.expect(tt.parenL);
    node.params = this.parseBindingList(
      tt.parenR,
      /* allowEmpty */ false,
      allowModifiers,
    );

    this.state.inParameters = oldInParameters;
    this.checkYieldAwaitInDefaultParams();
  }

  checkFunctionStatementId(node: N.Function): void {
    if (!node.id) return;

    // If it is a regular function declaration in sloppy mode, then it is
    // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
    // mode depends on properties of the current scope (see
    // treatFunctionsAsVar).
    this.checkLVal(
      node.id,
      this.state.strict || node.generator || node.async
        ? this.scope.treatFunctionsAsVar
          ? BIND_VAR
          : BIND_LEXICAL
        : BIND_FUNCTION,
      null,
      "function name",
    );
  }

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  parseClass<T: N.Class>(
    node: T,
    isStatement: /* T === ClassDeclaration */ boolean,
    optionalId?: boolean,
  ): T {
    this.next();
    this.takeDecorators(node);

    // A class definition is always strict mode code.
    const oldStrict = this.state.strict;
    this.state.strict = true;

    this.parseClassId(node, isStatement, optionalId);
    this.parseClassSuper(node);
    node.body = this.parseClassBody(!!node.superClass);

    this.state.strict = oldStrict;

    return this.finishNode(
      node,
      isStatement ? "ClassDeclaration" : "ClassExpression",
    );
  }

  isClassProperty(): boolean {
    return this.match(tt.eq) || this.match(tt.semi) || this.match(tt.braceR);
  }

  isClassMethod(): boolean {
    return this.match(tt.parenL);
  }

  isNonstaticConstructor(method: N.ClassMethod | N.ClassProperty): boolean {
    return (
      !method.computed &&
      !method.static &&
      (method.key.name === "constructor" || // Identifier
        method.key.value === "constructor") // String literal
    );
  }

  parseClassBody(constructorAllowsSuper: boolean): N.ClassBody {
    this.state.classLevel++;

    const state = { hadConstructor: false };
    let decorators: N.Decorator[] = [];
    const classBody: N.ClassBody = this.startNode();
    classBody.body = [];

    this.expect(tt.braceL);

    // For the smartPipelines plugin: Disable topic references from outer
    // contexts within the class body. They are permitted in test expressions,
    // outside of the class body.
    this.withTopicForbiddingContext(() => {
      while (!this.eat(tt.braceR)) {
        if (this.eat(tt.semi)) {
          if (decorators.length > 0) {
            this.raise(
              this.state.lastTokEnd,
              "Decorators must not be followed by a semicolon",
            );
          }
          continue;
        }

        if (this.match(tt.at)) {
          decorators.push(this.parseDecorator());
          continue;
        }

        const member = this.startNode();

        // steal the decorators if there are any
        if (decorators.length) {
          member.decorators = decorators;
          this.resetStartLocationFromNode(member, decorators[0]);
          decorators = [];
        }

        this.parseClassMember(classBody, member, state, constructorAllowsSuper);

        if (
          member.kind === "constructor" &&
          member.decorators &&
          member.decorators.length > 0
        ) {
          this.raise(
            member.start,
            "Decorators can't be used with a constructor. Did you mean '@dec class { ... }'?",
          );
        }
      }
    });

    if (decorators.length) {
      this.raise(
        this.state.start,
        "You have trailing decorators with no method",
      );
    }

    this.state.classLevel--;

    return this.finishNode(classBody, "ClassBody");
  }

  parseClassMember(
    classBody: N.ClassBody,
    member: N.ClassMember,
    state: { hadConstructor: boolean },
    constructorAllowsSuper: boolean,
  ): void {
    let isStatic = false;
    const containsEsc = this.state.containsEsc;

    if (this.match(tt.name) && this.state.value === "static") {
      const key = this.parseIdentifier(true); // eats 'static'

      if (this.isClassMethod()) {
        const method: N.ClassMethod = (member: any);

        // a method named 'static'
        method.kind = "method";
        method.computed = false;
        method.key = key;
        method.static = false;
        this.pushClassMethod(
          classBody,
          method,
          false,
          false,
          /* isConstructor */ false,
          false,
        );
        return;
      } else if (this.isClassProperty()) {
        const prop: N.ClassProperty = (member: any);

        // a property named 'static'
        prop.computed = false;
        prop.key = key;
        prop.static = false;
        classBody.body.push(this.parseClassProperty(prop));
        return;
      } else if (containsEsc) {
        throw this.unexpected();
      }

      // otherwise something static
      isStatic = true;
    }

    this.parseClassMemberWithIsStatic(
      classBody,
      member,
      state,
      isStatic,
      constructorAllowsSuper,
    );
  }

  parseClassMemberWithIsStatic(
    classBody: N.ClassBody,
    member: N.ClassMember,
    state: { hadConstructor: boolean },
    isStatic: boolean,
    constructorAllowsSuper: boolean,
  ) {
    const publicMethod: $FlowSubtype<N.ClassMethod> = member;
    const privateMethod: $FlowSubtype<N.ClassPrivateMethod> = member;
    const publicProp: $FlowSubtype<N.ClassMethod> = member;
    const privateProp: $FlowSubtype<N.ClassPrivateMethod> = member;

    const method: typeof publicMethod | typeof privateMethod = publicMethod;
    const publicMember: typeof publicMethod | typeof publicProp = publicMethod;

    member.static = isStatic;

    if (this.eat(tt.star)) {
      // a generator
      method.kind = "method";
      this.parseClassPropertyName(method);

      if (method.key.type === "PrivateName") {
        // Private generator method
        this.pushClassPrivateMethod(classBody, privateMethod, true, false);
        return;
      }

      if (this.isNonstaticConstructor(publicMethod)) {
        this.raise(publicMethod.key.start, "Constructor can't be a generator");
      }

      this.pushClassMethod(
        classBody,
        publicMethod,
        true,
        false,
        /* isConstructor */ false,
        false,
      );

      return;
    }

    const containsEsc = this.state.containsEsc;
    const key = this.parseClassPropertyName(member);
    const isPrivate = key.type === "PrivateName";
    // Check the key is not a computed expression or string literal.
    const isSimple = key.type === "Identifier";

    this.parsePostMemberNameModifiers(publicMember);

    if (this.isClassMethod()) {
      method.kind = "method";

      if (isPrivate) {
        this.pushClassPrivateMethod(classBody, privateMethod, false, false);
        return;
      }

      // a normal method
      const isConstructor = this.isNonstaticConstructor(publicMethod);
      let allowsDirectSuper = false;
      if (isConstructor) {
        publicMethod.kind = "constructor";

        if (publicMethod.decorators) {
          this.raise(
            publicMethod.start,
            "You can't attach decorators to a class constructor",
          );
        }

        // TypeScript allows multiple overloaded constructor declarations.
        if (state.hadConstructor && !this.hasPlugin("typescript")) {
          this.raise(key.start, "Duplicate constructor in the same class");
        }
        state.hadConstructor = true;
        allowsDirectSuper = constructorAllowsSuper;
      }

      this.pushClassMethod(
        classBody,
        publicMethod,
        false,
        false,
        isConstructor,
        allowsDirectSuper,
      );
    } else if (this.isClassProperty()) {
      if (isPrivate) {
        this.pushClassPrivateProperty(classBody, privateProp);
      } else {
        this.pushClassProperty(classBody, publicProp);
      }
    } else if (
      isSimple &&
      key.name === "async" &&
      !containsEsc &&
      !this.isLineTerminator()
    ) {
      // an async method
      const isGenerator = this.eat(tt.star);

      method.kind = "method";
      // The so-called parsed name would have been "async": get the real name.
      this.parseClassPropertyName(method);

      if (method.key.type === "PrivateName") {
        // private async method
        this.pushClassPrivateMethod(
          classBody,
          privateMethod,
          isGenerator,
          true,
        );
      } else {
        if (this.isNonstaticConstructor(publicMethod)) {
          this.raise(
            publicMethod.key.start,
            "Constructor can't be an async function",
          );
        }

        this.pushClassMethod(
          classBody,
          publicMethod,
          isGenerator,
          true,
          /* isConstructor */ false,
          false,
        );
      }
    } else if (
      isSimple &&
      (key.name === "get" || key.name === "set") &&
      !containsEsc &&
      !(this.match(tt.star) && this.isLineTerminator())
    ) {
      // `get\n*` is an uninitialized property named 'get' followed by a generator.
      // a getter or setter
      method.kind = key.name;
      // The so-called parsed name would have been "get/set": get the real name.
      this.parseClassPropertyName(publicMethod);

      if (method.key.type === "PrivateName") {
        // private getter/setter
        this.pushClassPrivateMethod(classBody, privateMethod, false, false);
      } else {
        if (this.isNonstaticConstructor(publicMethod)) {
          this.raise(
            publicMethod.key.start,
            "Constructor can't have get/set modifier",
          );
        }
        this.pushClassMethod(
          classBody,
          publicMethod,
          false,
          false,
          /* isConstructor */ false,
          false,
        );
      }

      this.checkGetterSetterParams(publicMethod);
    } else if (this.isLineTerminator()) {
      // an uninitialized class property (due to ASI, since we don't otherwise recognize the next token)
      if (isPrivate) {
        this.pushClassPrivateProperty(classBody, privateProp);
      } else {
        this.pushClassProperty(classBody, publicProp);
      }
    } else {
      this.unexpected();
    }
  }

  parseClassPropertyName(member: N.ClassMember): N.Expression | N.Identifier {
    const key = this.parsePropertyName(member);

    if (
      !member.computed &&
      member.static &&
      ((key: $FlowSubtype<N.Identifier>).name === "prototype" ||
        (key: $FlowSubtype<N.StringLiteral>).value === "prototype")
    ) {
      this.raise(
        key.start,
        "Classes may not have static property named prototype",
      );
    }

    if (key.type === "PrivateName" && key.id.name === "constructor") {
      this.raise(
        key.start,
        "Classes may not have a private field named '#constructor'",
      );
    }

    return key;
  }

  pushClassProperty(classBody: N.ClassBody, prop: N.ClassProperty) {
    // This only affects properties, not methods.
    if (this.isNonstaticConstructor(prop)) {
      this.raise(
        prop.key.start,
        "Classes may not have a non-static field named 'constructor'",
      );
    }
    classBody.body.push(this.parseClassProperty(prop));
  }

  pushClassPrivateProperty(
    classBody: N.ClassBody,
    prop: N.ClassPrivateProperty,
  ) {
    this.expectPlugin("classPrivateProperties", prop.key.start);
    classBody.body.push(this.parseClassPrivateProperty(prop));
  }

  pushClassMethod(
    classBody: N.ClassBody,
    method: N.ClassMethod,
    isGenerator: boolean,
    isAsync: boolean,
    isConstructor: boolean,
    allowsDirectSuper: boolean,
  ): void {
    classBody.body.push(
      this.parseMethod(
        method,
        isGenerator,
        isAsync,
        isConstructor,
        allowsDirectSuper,
        "ClassMethod",
        true,
      ),
    );
  }

  pushClassPrivateMethod(
    classBody: N.ClassBody,
    method: N.ClassPrivateMethod,
    isGenerator: boolean,
    isAsync: boolean,
  ): void {
    this.expectPlugin("classPrivateMethods", method.key.start);
    classBody.body.push(
      this.parseMethod(
        method,
        isGenerator,
        isAsync,
        /* isConstructor */ false,
        false,
        "ClassPrivateMethod",
        true,
      ),
    );
  }

  // Overridden in typescript.js
  parsePostMemberNameModifiers(
    // eslint-disable-next-line no-unused-vars
    methodOrProp: N.ClassMethod | N.ClassProperty,
  ): void {}

  // Overridden in typescript.js
  parseAccessModifier() {
    return undefined;
  }

  parseClassPrivateProperty(
    node: N.ClassPrivateProperty,
  ) {
    this.state.inClassProperty = true;

    this.scope.enter(SCOPE_CLASS | SCOPE_SUPER);

    node.value = this.eat(tt.eq) ? this.parseMaybeAssign() : null;
    this.semicolon();
    this.state.inClassProperty = false;

    this.scope.exit();

    return this.finishNode(node, "ClassPrivateProperty");
  }

  parseClassProperty(node: N.ClassProperty) {
    if (!node.typeAnnotation) {
      this.expectPlugin("classProperties");
    }

    this.state.inClassProperty = true;

    this.scope.enter(SCOPE_CLASS | SCOPE_SUPER);

    if (this.match(tt.eq)) {
      this.expectPlugin("classProperties");
      this.next();
      node.value = this.parseMaybeAssign();
    } else {
      node.value = null;
    }
    this.semicolon();
    this.state.inClassProperty = false;

    this.scope.exit();

    return this.finishNode(node, "ClassProperty");
  }

  parseClassId(
    node: N.Class,
    isStatement: boolean,
    optionalId: ?boolean,
  ): void {
    if (this.match(tt.name)) {
      node.id = this.parseIdentifier();
      if (isStatement) {
        this.checkLVal(node.id, BIND_CLASS, undefined, "class name");
      }
    } else {
      if (optionalId || !isStatement) {
        node.id = null;
      } else {
        this.unexpected(null, "A class name is required");
      }
    }
  }

  parseClassSuper(node: N.Class): void {
    node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
  }

  // Parses module export declaration.

  parseExport(node: N.Node): N.AnyExport {
    const hasDefault = this.maybeParseExportDefaultSpecifier(node);
    const parseAfterDefault = !hasDefault || this.eat(tt.comma);
    const hasStar = parseAfterDefault && this.eatExportStar(node);
    const hasNamespace =
      hasStar && this.maybeParseExportNamespaceSpecifier(node);
    const parseAfterNamespace =
      parseAfterDefault && (!hasNamespace || this.eat(tt.comma));
    const isFromRequired = hasDefault || hasStar;

    if (hasStar && !hasNamespace) {
      if (hasDefault) this.unexpected();
      this.parseExportFrom(node, true);

      return this.finishNode(node, "ExportAllDeclaration");
    }

    const hasSpecifiers = this.maybeParseExportNamedSpecifiers(node);

    if (
      (hasDefault && parseAfterDefault && !hasStar && !hasSpecifiers) ||
      (hasNamespace && parseAfterNamespace && !hasSpecifiers)
    ) {
      throw this.unexpected(null, tt.braceL);
    }

    let hasDeclaration;
    if (isFromRequired || hasSpecifiers) {
      hasDeclaration = false;
      this.parseExportFrom(node, isFromRequired);
    } else {
      hasDeclaration = this.maybeParseExportDeclaration(node);
    }

    if (isFromRequired || hasSpecifiers || hasDeclaration) {
      this.checkExport(node, true, false, !!node.source);
      return this.finishNode(node, "ExportNamedDeclaration");
    }

    if (this.eat(tt._default)) {
      // export default ...
      node.declaration = this.parseExportDefaultExpression();
      this.checkExport(node, true, true);

      return this.finishNode(node, "ExportDefaultDeclaration");
    }

    throw this.unexpected(null, tt.braceL);
  }

  // eslint-disable-next-line no-unused-vars
  eatExportStar(node: N.Node): boolean {
    return this.eat(tt.star);
  }

  maybeParseExportDefaultSpecifier(node: N.Node): boolean {
    if (this.isExportDefaultSpecifier()) {
      // export defaultObj ...
      this.expectPlugin("exportDefaultFrom");
      const specifier = this.startNode();
      specifier.exported = this.parseIdentifier(true);
      node.specifiers = [this.finishNode(specifier, "ExportDefaultSpecifier")];
      return true;
    }
    return false;
  }

  maybeParseExportNamespaceSpecifier(node: N.Node): boolean {
    if (this.isContextual("as")) {
      if (!node.specifiers) node.specifiers = [];
      this.expectPlugin("exportNamespaceFrom");

      const specifier = this.startNodeAt(
        this.state.lastTokStart,
        this.state.lastTokStartLoc,
      );

      this.next();

      specifier.exported = this.parseIdentifier(true);
      node.specifiers.push(
        this.finishNode(specifier, "ExportNamespaceSpecifier"),
      );
      return true;
    }
    return false;
  }

  maybeParseExportNamedSpecifiers(node: N.Node): boolean {
    if (this.match(tt.braceL)) {
      if (!node.specifiers) node.specifiers = [];
      node.specifiers.push(...this.parseExportSpecifiers());

      node.source = null;
      node.declaration = null;

      return true;
    }
    return false;
  }

  maybeParseExportDeclaration(node: N.Node): boolean {
    if (this.shouldParseExportDeclaration()) {
      if (this.isContextual("async")) {
        const next = this.lookahead();

        // export async;
        if (next.type !== tt._function) {
          this.unexpected(next.start, `Unexpected token, expected "function"`);
        }
      }

      node.specifiers = [];
      node.source = null;
      node.declaration = this.parseExportDeclaration(node);

      return true;
    }
    return false;
  }

  isAsyncFunction(): boolean {
    if (!this.isContextual("async")) return false;

    const { pos } = this.state;

    skipWhiteSpace.lastIndex = pos;
    const skip = skipWhiteSpace.exec(this.input);

    if (!skip || !skip.length) return false;

    const next = pos + skip[0].length;

    return (
      !lineBreak.test(this.input.slice(pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.length ||
        !isIdentifierChar(this.input.charCodeAt(next + 8)))
    );
  }

  parseExportDefaultExpression(): N.Expression | N.Declaration {
    const expr = this.startNode();

    const isAsync = this.isAsyncFunction();

    if (this.match(tt._function) || isAsync) {
      this.next();
      if (isAsync) {
        this.next();
      }

      return this.parseFunction(
        expr,
        FUNC_STATEMENT | FUNC_NULLABLE_ID,
        isAsync,
      );
    } else if (this.match(tt._class)) {
      return this.parseClass(expr, true, true);
    } else if (this.match(tt.at)) {
      if (
        this.hasPlugin("decorators") &&
        this.getPluginOption("decorators", "decoratorsBeforeExport")
      ) {
        this.unexpected(
          this.state.start,
          "Decorators must be placed *before* the 'export' keyword." +
            " You can set the 'decoratorsBeforeExport' option to false to use" +
            " the 'export @decorator class {}' syntax",
        );
      }
      this.parseDecorators(false);
      return this.parseClass(expr, true, true);
    } else if (this.match(tt._const) || this.match(tt._var) || this.isLet()) {
      return this.raise(
        this.state.start,
        "Only expressions, functions or classes are allowed as the `default` export.",
      );
    } else {
      const res = this.parseMaybeAssign();
      this.semicolon();
      return res;
    }
  }

  // eslint-disable-next-line no-unused-vars
  parseExportDeclaration(node: N.ExportNamedDeclaration): ?N.Declaration {
    return this.parseStatement(null);
  }

  isExportDefaultSpecifier(): boolean {
    if (this.match(tt.name)) {
      return this.state.value !== "async" && this.state.value !== "let";
    }

    if (!this.match(tt._default)) {
      return false;
    }

    const lookahead = this.lookahead();
    return (
      lookahead.type === tt.comma ||
      (lookahead.type === tt.name && lookahead.value === "from")
    );
  }

  parseExportFrom(node: N.ExportNamedDeclaration, expect?: boolean): void {
    if (this.eatContextual("from")) {
      node.source = this.parseImportSource();
      this.checkExport(node);
    } else {
      if (expect) {
        this.unexpected();
      } else {
        node.source = null;
      }
    }

    this.semicolon();
  }

  shouldParseExportDeclaration(): boolean {
    if (this.match(tt.at)) {
      this.expectOnePlugin(["decorators", "decorators-legacy"]);
      if (this.hasPlugin("decorators")) {
        if (this.getPluginOption("decorators", "decoratorsBeforeExport")) {
          this.unexpected(
            this.state.start,
            "Decorators must be placed *before* the 'export' keyword." +
              " You can set the 'decoratorsBeforeExport' option to false to use" +
              " the 'export @decorator class {}' syntax",
          );
        } else {
          return true;
        }
      }
    }

    return (
      this.state.type.keyword === "var" ||
      this.state.type.keyword === "const" ||
      this.state.type.keyword === "function" ||
      this.state.type.keyword === "class" ||
      this.isLet() ||
      this.isAsyncFunction()
    );
  }

  checkExport(
    node: N.ExportNamedDeclaration,
    checkNames?: boolean,
    isDefault?: boolean,
    isFrom?: boolean,
  ): void {
    if (checkNames) {
      // Check for duplicate exports
      if (isDefault) {
        // Default exports
        this.checkDuplicateExports(node, "default");
      } else if (node.specifiers && node.specifiers.length) {
        // Named exports
        for (const specifier of node.specifiers) {
          this.checkDuplicateExports(specifier, specifier.exported.name);
          // $FlowIgnore
          if (!isFrom && specifier.local) {
            // check for keywords used as local names
            this.checkReservedWord(
              specifier.local.name,
              specifier.local.start,
              true,
              false,
            );
            // check if export is defined
            // $FlowIgnore
            this.scope.checkLocalExport(specifier.local);
          }
        }
      } else if (node.declaration) {
        // Exported declarations
        if (
          node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "ClassDeclaration"
        ) {
          const id = node.declaration.id;
          if (!id) throw new Error("Assertion failure");

          this.checkDuplicateExports(node, id.name);
        } else if (node.declaration.type === "VariableDeclaration") {
          for (const declaration of node.declaration.declarations) {
            this.checkDeclaration(declaration.id);
          }
        }
      }
    }

    const currentContextDecorators = this.state.decoratorStack[
      this.state.decoratorStack.length - 1
    ];
    if (currentContextDecorators.length) {
      const isClass =
        node.declaration &&
        (node.declaration.type === "ClassDeclaration" ||
          node.declaration.type === "ClassExpression");
      if (!node.declaration || !isClass) {
        throw this.raise(
          node.start,
          "You can only use decorators on an export when exporting a class",
        );
      }
      this.takeDecorators(node.declaration);
    }
  }

  checkDeclaration(node: N.Pattern | N.ObjectProperty): void {
    if (node.type === "Identifier") {
      this.checkDuplicateExports(node, node.name);
    } else if (node.type === "ObjectPattern") {
      for (const prop of node.properties) {
        this.checkDeclaration(prop);
      }
    } else if (node.type === "ArrayPattern") {
      for (const elem of node.elements) {
        if (elem) {
          this.checkDeclaration(elem);
        }
      }
    } else if (node.type === "ObjectProperty") {
      this.checkDeclaration(node.value);
    } else if (node.type === "RestElement") {
      this.checkDeclaration(node.argument);
    } else if (node.type === "AssignmentPattern") {
      this.checkDeclaration(node.left);
    }
  }

  checkDuplicateExports(
    node:
      | N.Identifier
      | N.ExportNamedDeclaration
      | N.ExportSpecifier
      | N.ExportDefaultSpecifier,
    name: string,
  ): void {
    if (this.state.exportedIdentifiers.indexOf(name) > -1) {
      throw this.raise(
        node.start,
        name === "default"
          ? "Only one default export allowed per module."
          : `\`${name}\` has already been exported. Exported identifiers must be unique.`,
      );
    }
    this.state.exportedIdentifiers.push(name);
  }

  // Parses a comma-separated list of module exports.

  parseExportSpecifiers(): Array<N.ExportSpecifier> {
    const nodes = [];
    let first = true;

    // export { x, y as z } [from '...']
    this.expect(tt.braceL);

    while (!this.eat(tt.braceR)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma);
        if (this.eat(tt.braceR)) break;
      }

      const node = this.startNode();
      node.local = this.parseIdentifier(true);
      node.exported = this.eatContextual("as")
        ? this.parseIdentifier(true)
        : node.local.__clone();
      nodes.push(this.finishNode(node, "ExportSpecifier"));
    }

    return nodes;
  }

  // Parses import declaration.

  parseImport(node: N.Node): N.AnyImport {
    // import '...'
    node.specifiers = [];
    if (!this.match(tt.string)) {
      const hasDefault = this.maybeParseDefaultImportSpecifier(node);
      const parseNext = !hasDefault || this.eat(tt.comma);
      const hasStar = parseNext && this.maybeParseStarImportSpecifier(node);
      if (parseNext && !hasStar) this.parseNamedImportSpecifiers(node);
      this.expectContextual("from");
    }
    node.source = this.parseImportSource();
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  }

  parseImportSource(): N.StringLiteral {
    if (!this.match(tt.string)) this.unexpected();
    return this.parseExprAtom();
  }

  // eslint-disable-next-line no-unused-vars
  shouldParseDefaultImport(node: N.ImportDeclaration): boolean {
    return this.match(tt.name);
  }

  parseImportSpecifierLocal(
    node: N.ImportDeclaration,
    specifier: N.Node,
    type: string,
    contextDescription: string,
  ): void {
    specifier.local = this.parseIdentifier();
    this.checkLVal(
      specifier.local,
      BIND_LEXICAL,
      undefined,
      contextDescription,
    );
    node.specifiers.push(this.finishNode(specifier, type));
  }

  maybeParseDefaultImportSpecifier(node: N.ImportDeclaration): boolean {
    if (this.shouldParseDefaultImport(node)) {
      // import defaultObj, { x, y as z } from '...'
      this.parseImportSpecifierLocal(
        node,
        this.startNode(),
        "ImportDefaultSpecifier",
        "default import specifier",
      );
      return true;
    }
    return false;
  }

  maybeParseStarImportSpecifier(node: N.ImportDeclaration): boolean {
    if (this.match(tt.star)) {
      const specifier = this.startNode();
      this.next();
      this.expectContextual("as");

      this.parseImportSpecifierLocal(
        node,
        specifier,
        "ImportNamespaceSpecifier",
        "import namespace specifier",
      );
      return true;
    }
    return false;
  }

  parseNamedImportSpecifiers(node: N.ImportDeclaration) {
    let first = true;
    this.expect(tt.braceL);
    while (!this.eat(tt.braceR)) {
      if (first) {
        first = false;
      } else {
        // Detect an attempt to deep destructure
        if (this.eat(tt.colon)) {
          this.unexpected(
            null,
            "ES2015 named imports do not destructure. " +
              "Use another statement for destructuring after the import.",
          );
        }

        this.expect(tt.comma);
        if (this.eat(tt.braceR)) break;
      }

      this.parseImportSpecifier(node);
    }
  }

  parseImportSpecifier(node: N.ImportDeclaration): void {
    const specifier = this.startNode();
    specifier.imported = this.parseIdentifier(true);
    if (this.eatContextual("as")) {
      specifier.local = this.parseIdentifier();
    } else {
      this.checkReservedWord(
        specifier.imported.name,
        specifier.start,
        true,
        true,
      );
      specifier.local = specifier.imported.__clone();
    }
    this.checkLVal(
      specifier.local,
      BIND_LEXICAL,
      undefined,
      "import specifier",
    );
    node.specifiers.push(this.finishNode(specifier, "ImportSpecifier"));
  }
}
