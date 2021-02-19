// timeline is basically a special
// container for tweens
export class Timeline  extends Animation {

    constructor(vars = {}, time) {
		super(vars, time);
		this.labels = {};
	}

    render (totalTime) {
		if (totalTime !== this._tTime) {
            let child = this._first
            
            while (child) {
                let next = child._next
                let childTime = (totalTime - child._start) * child._ts
            
                child.render(childTime)
                child = next
            }
		}
    }
    
    add (child, position) {
		child._start = _round(position + child._delay);
        child._end = _round(child._start + ((child.totalDuration() / Math.abs(child.timeScale())) || 0))
		_addLinkedListItem(this, child, "_first", "_last", this._sort ? "_start" : 0)
    }

    remove (child) {
		_removeLinkedListItem(this, child);
	}

	addPause (position) {
        let t = Tween.delayedCall(0, _emptyFunc)
        t.data = "isPause"
		return this.add(t, position)
    }

    removePause (position) {
		let child = this._first;
		while (child) {
			if (child._start === position && child.data === "isPause") {
				_removeFromParent(child);
			}
			child = child._next;
		}
	}
}

let _addLinkedListItem = (parent, child, firstProp = "_first", lastProp = "_last", sortBy) => {
    let prev = parent[lastProp],
        t;
    if (sortBy) {
        t = child[sortBy];
        while (prev && prev[sortBy] > t) {
            prev = prev._prev;
        }
    }
    if (prev) {
        child._next = prev._next;
        prev._next = child;
    } else {
        child._next = parent[firstProp];
        parent[firstProp] = child;
    }
    if (child._next) {
        child._next._prev = child;
    } else {
        parent[lastProp] = child;
    }
    child._prev = prev;
    child.parent = child._dp = parent;
    return child;
}

let _removeLinkedListItem = (parent, child, firstProp = "_first", lastProp = "_last") => {
    let prev = child._prev,
        next = child._next;
    if (prev) {
        prev._next = next;
    } else if (parent[firstProp] === child) {
        parent[firstProp] = next;
    }
    if (next) {
        next._prev = prev;
    } else if (parent[lastProp] === child) {
        parent[lastProp] = prev;
    }
    child._next = child._prev = child.parent = null
}