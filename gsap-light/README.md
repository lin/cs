Minified Logic:

```javascript
let tl = new Timeline()
tl.add(new Tween(target: '#square', {duration: 1, x: 100}))
tl.add(new Tween(target: '#circle', {duration: 2, y: 300}))

tick (time) {
  let tlTime = (time - tl.start) * tl.timeScale

  for (const tween in tl.children) {
      let currentTime = (tlTime - tween.start) * tween.timeScale
      let duration = tween.duration * tween.timeScale

      let progress = currentTime / duration
      let ratio = tween.easeFunction(progress)
      let value = tween.startValue + ratio * tween.changeValue

      tween.target.setAttribute(tween.property, value)
  }

  requestAnimationFrame(tick)
}

tick()
```

