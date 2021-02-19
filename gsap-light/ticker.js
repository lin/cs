
export class Ticker {

    constructor () {
        this.time = 0
        this.frame = 0
        this._listeners = []
        this._active = 0
        this._fps = 60
        this._gap = 1 / this._fps // 240 is frame per second
        this._nextTime = this._gap
        this._startTime = Date.now()
        this._lastUpdate = this._startTime

        this._req = requestAnimationFrame
    }

    tick () {
        // elaspsed from lastUpdate
        let elapsed = Date.now() - _lastUpdate

        // update lastUpdate
        this._lastUpdate += elapsed;

        // current time in seconds
        this.time = (_lastUpdate - _startTime) / 1000;

        // if need to update frame
        let overlap = this.time - this._nextTime;

        if (overlap > 0) {
            this.frame++;
            this._nextTime += overlap + (overlap >= _gap ? 1 / 60 : _gap - overlap);
        }

        this._id = _req(this.tick)
        
        // call listeners
        if (overlap > 0) {
            this._listeners.forEach(l => l(this.time, elapsed, this.frame));
        }
    }

    wake () {
        if (this._id) this.sleep();
        this._active = 1;
        this._tick();
    }

    sleep () {
        this._active = 0;
        this._req = _ => _;
    }
}