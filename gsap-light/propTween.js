
export class PropTween {

	constructor(next, target, prop, start, change, renderer, setter) {
		this.t = target;
		this.s = start;
		this.c = change;
		this.p = prop;
		this.r = renderer || _renderPlain;
		this.d = this;
		this.set = setter || _setterPlain;
		this._next = next;
		if (next) {
			next._prev = this;
		}
    }
    
    renderPlain (ratio) {
        this.set(this.t, this.p, Math.round((this.s + this.c * ratio) * 10000) / 10000, pt)
    }

    setterPlain (target, property, value) { 
        target[property] = value 
    }

    setterFunc (target, property, value) { 
        target[property](value) 
    }
}