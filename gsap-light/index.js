import Ticker from './ticker.js'

let _ticker = new Ticker()

let _globalTimeline = new Timeline({
    sortChildren:       false, 
    defaults:           _defaults, 
    autoRemoveChildren: true, 
    id:                 "root", 
    smoothChildTiming:  true
});

let _parentToChildTotalTime = (parentTime, child) => {
    let commonTotalTime = (parentTime - child._start) * child._ts
    let isReverse = child._ts >= 0
    return commonTotalTime + ( isReverse ? 0 : child.tDur)
}

let updateRoot = function (time) {
    if (_globalTimeline._ts) {
        let totalTime = _parentToChildTotalTime(time, _globalTimeline)
        _globalTimeline.render(totalTime)
    }
}

_ticker.add(updateRoot)