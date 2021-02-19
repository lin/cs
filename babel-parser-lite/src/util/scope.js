const SCOPE_OTHER        = 0b000000000,
     SCOPE_PROGRAM      = 0b000000001,
     SCOPE_FUNCTION     = 0b000000010,
     SCOPE_ASYNC        = 0b000000100,
     SCOPE_GENERATOR    = 0b000001000,
     SCOPE_ARROW        = 0b000010000,
     SCOPE_SIMPLE_CATCH = 0b000100000,
     SCOPE_SUPER        = 0b001000000,
     SCOPE_DIRECT_SUPER = 0b010000000,
     SCOPE_CLASS        = 0b100000000,
     SCOPE_VAR = SCOPE_PROGRAM | SCOPE_FUNCTION;

function functionFlags(isAsync: boolean, isGenerator: boolean) {
 return (
   SCOPE_FUNCTION |
   (isAsync ? SCOPE_ASYNC : 0) |
   (isGenerator ? SCOPE_GENERATOR : 0)
 );
}


class Scope {
  constructor(flags) {
    this.flags = flags;
    this.var = [];
    this.lexical = [];
    this.funcions = [];
  }
}

export default class ScopeHandler {

  constructor(raise: raiseFunction, inModule: boolean) {
    this.raise = raise;
    this.inModule = inModule;
    this.scopeStack = []
    this.undefinedExports = new Map();
  }

  get inFunction() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  }
  get inGenerator() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
  }
  get inAsync() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
  }
  get allowSuper() {
    return (this.currentThisScope().flags & SCOPE_SUPER) > 0;
  }
  get allowDirectSuper() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  }
  get inNonArrowFunction() {
    return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0;
  }
  get treatFunctionsAsVar() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  }

  createScope(flags) {
    return new Scope(flags);
  }

  enter(flags) {
    this.scopeStack.push(this.createScope(flags));
  }

  exit() {
    this.scopeStack.pop();
  }

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  treatFunctionsAsVarInScope(scope) {
    return !!(
      scope.flags & SCOPE_FUNCTION ||
      (!this.inModule && scope.flags & SCOPE_PROGRAM)
    );
  }

  declareName(name: string, bindingType: BindingTypes, pos: number) {
    let scope = this.currentScope();
    if (bindingType & BIND_SCOPE_LEXICAL || bindingType & BIND_SCOPE_FUNCTION) {
      this.checkRedeclarationInScope(scope, name, bindingType, pos);

      if (bindingType & BIND_SCOPE_FUNCTION) {
        scope.functions.push(name);
      } else {
        scope.lexical.push(name);
      }

      if (bindingType & BIND_SCOPE_LEXICAL) {
        this.maybeExportDefined(scope, name);
      }
    } else if (bindingType & BIND_SCOPE_VAR) {
      for (let i = this.scopeStack.length - 1; i >= 0; --i) {
        scope = this.scopeStack[i];
        this.checkRedeclarationInScope(scope, name, bindingType, pos);
        scope.var.push(name);
        this.maybeExportDefined(scope, name);

        if (scope.flags & SCOPE_VAR) break;
      }
    }
    if (this.inModule && scope.flags & SCOPE_PROGRAM) {
      this.undefinedExports.delete(name);
    }
  }

  maybeExportDefined(scope, name) {
    if (this.inModule && scope.flags & SCOPE_PROGRAM) {
      this.undefinedExports.delete(name);
    }
  }

  checkRedeclarationInScope(
    scope: IScope,
    name: string,
    bindingType: BindingTypes,
    pos: number,
  ) {
    if (this.isRedeclaredInScope(scope, name, bindingType)) {
      this.raise(pos, `Identifier '${name}' has already been declared`);
    }
  }

  isRedeclaredInScope(
    scope,
    name,
    bindingType,
  ) {
    if (!(bindingType & BIND_KIND_VALUE)) return false;

    if (bindingType & BIND_SCOPE_LEXICAL) {
      return (
        scope.lexical.indexOf(name) > -1 ||
        scope.functions.indexOf(name) > -1 ||
        scope.var.indexOf(name) > -1
      );
    }

    if (bindingType & BIND_SCOPE_FUNCTION) {
      return (
        scope.lexical.indexOf(name) > -1 ||
        (!this.treatFunctionsAsVarInScope(scope) &&
          scope.var.indexOf(name) > -1)
      );
    }

    return (
      (scope.lexical.indexOf(name) > -1 &&
        !(scope.flags & SCOPE_SIMPLE_CATCH && scope.lexical[0] === name)) ||
      (!this.treatFunctionsAsVarInScope(scope) &&
        scope.functions.indexOf(name) > -1)
    );
  }

  checkLocalExport(id) {
    if (
      this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1 &&
      // In strict mode, scope.functions will always be empty.
      // Modules are strict by default, but the `scriptMode` option
      // can overwrite this behavior.
      this.scopeStack[0].functions.indexOf(id.name) === -1
    ) {
      this.undefinedExports.set(id.name, id.start);
    }
  }

  currentScope() {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  // $FlowIgnore
  currentVarScope() {
    for (let i = this.scopeStack.length - 1; ; i--) {
      const scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) {
        return scope;
      }
    }
  }

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  currentThisScope(): IScope {
    for (let i = this.scopeStack.length - 1; ; i--) {
      const scope = this.scopeStack[i];
      if (
        (scope.flags & SCOPE_VAR || scope.flags & SCOPE_CLASS) &&
        !(scope.flags & SCOPE_ARROW)
      ) {
        return scope;
      }
    }
  }
}
