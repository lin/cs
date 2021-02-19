class Namespace {

    constructor(builtins, globalMacros) {
        this.current = globalMacros;
        this.builtins = builtins;
        this.undefStack = [];
    }

    beginGroup() {
        this.undefStack.push({});
    }

    endGroup() {
        const undefs = this.undefStack.pop();
        for (const undef in undefs) {
            if (undefs.hasOwnProperty(undef)) {
                if (undefs[undef] === undefined) {
                    delete this.current[undef];
                } else {
                    this.current[undef] = undefs[undef];
                }
            }
        }
    }

    has(name) {
        return this.current.hasOwnProperty(name) ||
               this.builtins.hasOwnProperty(name);
    }

    get(name) {
        if (this.current.hasOwnProperty(name)) {
            return this.current[name];
        } else {
            return this.builtins[name];
        }
    }

    set(name, value, global) {
        if (global) {
            for (let i = 0; i < this.undefStack.length; i++) {
                delete this.undefStack[i][name];
            }
            if (this.undefStack.length > 0) {
                this.undefStack[this.undefStack.length - 1][name] = value;
            }
        } else {
            const top = this.undefStack[this.undefStack.length - 1];
            if (top && !top.hasOwnProperty(name)) {
                top[name] = this.current[name];
            }
        }
        this.current[name] = value;
    }
}


module.exports = Namespace
