let a = [1, 2]
let b = a
a.push(3)
console.log(a)
console.log(b)
a = [0]
console.log(a)
console.log(b)

// c++
int *a = [1, 2]
int *b = a
a->push(3)
int *c = [0]
a = c
// not *a = [0]
