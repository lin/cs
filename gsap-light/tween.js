export class Tween extends Animation {

    constructor(targets, vars, time) {
		super(vars, time);
		this._targets = targets
		this._ptLookup = []
	}

    render (time) { 
        if (!this._dur) this.renderZero(time)
        if (!this._initted) this.init(time)

        this.ratio = this._ease(time / this._dur)
        if (this._from) this.ratio = ratio = 1 - ratio

        pt = this._pt
        while (pt) {
            pt.r(this.ratio, pt.d)
            pt = pt._next
        }
    }

    init () {
        let ptLookup
        let vars = this.vars
        this._pt = 0
        
        for (i = 0; i < targets.length; i++) {
            target = targets[i]
            this._ptLookup[i] = ptLookup = {}
            
            for (p in vars) {
                if (_plugins[p]) {
                    this.checkPlugin(p, this.vars, i, target, targets)
                } else {
                    ptLookup[p] = this.addPropTween(target, p, "get", this.vars[p]);
                }
            }
        }
    }
    
    addPropTween (target, prop, start, end) {
        let currentValue = target[prop]

        start = (start !== "get") 
                ? start 
                : !_isFunction(currentValue) 
                ? currentValue 
                : currentValue()
			
        let setter = !_isFunction(currentValue) ? _setterPlain : _setterFunc
    
        this._pt = new PropTween(
            this._pt,
            target,
            prop, // property
            +start || 0, 
            end - (start || 0), // change
            _renderPlain, 
            setter
        )

        if (!currentValue && !(prop in target)) {
            console.warn("Invalid property", prop, "set to", currentValue, "Missing plugin? gsap.registerPlugin()")
        }
    }

    checkPlugin (property, vars, index, target, targets) {
        if (_plugins[property]) {
            let plugin = new _plugins[property]()
            plugin.init(target, vars[property], tween, index, targets)

            this._pt = new PropTween(
                this._pt, 
                target, 
                property, 
                0, 
                1, 
                plugin.render, 
                plugin
            )
        }
    }

    renderZero (time) { time }

    static to(targets, vars) {
		return new Tween(targets, vars, arguments[2]);
	}

	static from(targets, vars) {
		return new Tween(targets, _parseVars(arguments, 1));
	}

	static delayedCall(delay, callback, params, scope) {
		return new Tween(callback, 0, {
			immediateRender: false, 
			lazy: false, 
			overwrite: false, 
			delay: delay, 
			onComplete: callback, 
			onReverseComplete: callback, 
			onCompleteParams: params, 
			onReverseCompleteParams: params, 
			callbackScope: scope
		});
	}

	static fromTo(targets, fromVars, toVars) {
		return new Tween(targets, _parseVars(arguments, 2));
	}

	static set(targets, vars) {
		vars.duration = 0;
		vars.repeatDelay || (vars.repeat = 0);
		return new Tween(targets, vars);
	}
}