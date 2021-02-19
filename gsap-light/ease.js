let _easeMap = {}
let _insertEase = (
    names, 
    easeIn, 
    easeOut = p => 1 - easeIn(1 - p), 
    easeInOut = (p => p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2)
) => {
    let ease = {easeIn, easeOut, easeInOut}

    _forEachName(names, name => {
        _easeMap[name] = ease;
        for (let p in ease) {
            _easeMap[name + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p]
        }
    })

    return ease
}

_easeInOutFromOut = easeOut => (p => p < .5 ? (1 - easeOut(1 - (p * 2))) / 2 : .5 + easeOut((p - .5) * 2) / 2),


_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", (name, i) => {
    let power = i < 5 ? i + 1 : i

    _insertEase(
        name + ",Power" + (power - 1), 
        i ? p => p ** power : p => p, 
        p => 1 - (1 - p) ** power, 
        p => p < .5 ? (p * 2) ** power / 2 : 1 - ((1 - p) * 2) ** power / 2
    )
})

((n, c) => {
let n1 = 1 / c,
    n2 = 2 * n1,
    n3 = 2.5 * n1,
    easeOut = p => (p < n1) 
            ? n * p * p 
            : (p < n2) 
            ? n * (p - 1.5 / c) ** 2 + .75 
            : (p < n3) 
            ? n * (p -= 2.25 / c) * p + .9375 
            : n * (p - 2.625 / c) ** 2 + .984375

    _insertEase("Bounce", p => 1 - easeOut(1 - p), easeOut)
})(7.5625, 2.75)

_insertEase("Expo", p => p ? 2 ** (10 * (p - 1)) : 0)

_insertEase("Circ", p => -(_sqrt(1 - (p * p)) - 1))

_insertEase("Sine", p => -_cos(p * _HALF_PI) + 1)