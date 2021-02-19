export class Animation {

	constructor(vars, time) {
        //
        // defaults
        //
        this._time = 0
        this._start = 0
        this._end = 0
        this._dur = 0
        //
        this._tTime = 0
        this._tDur = 0
        //
        this._ts = 1
        this._ps = false
        this._rts = 1
        //
        let parent = vars.parent || _globalTimeline;
        this.vars = vars;
        this.data = vars.data
        //
        this._dur = +vars.duration
        this._tDur = this._dur
        this._end = _round(this._start + (animation._tDur / animation._ts))
        //
        if (_ticker.active) _ticker.wake()
        //
        // add to a timeline
        //
		parent.add(this, time, 1)
	}

	totalTime(totalTime, suppressEvents) {
		_wake();
        if (!arguments.length) return this._tTime
        this.render(totalTime, suppressEvents)
	}

	totalProgress(value) {
        return arguments.length 
             ? this.totalTime( this.totalDuration() * value) 
             : this._tTime / this._tDur
	}

	timeScale(value) {
		this._rts = +value || 0;
		this._ts = this._ps ? 0 : this._rts
	}

	paused(value) {
		if (!arguments.length) return this._ps
		if (this._ps !== value) {
			this._ps = value;
			if (value) {
				this._ts = 0
			} else {
				_wake();
				this._ts = this._rts;
                this.totalTime(this._tTime)
            }
		}
		return this;
	}

	seek(position) {
		return this.totalTime(position);
	}

	restart() {
		return this.play().totalTime(0);
	}

	play() {
		return this.paused(false);
	}

	pause(value) {
		if (value != null) this.seek(value);
		return this.paused(true);
	}

	resume() {
		return this.paused(false);
	}
}