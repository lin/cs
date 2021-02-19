class DisjointSet {

  constructor () {
    this.data = []
  }

  makeSet (val) {
    if (!this.data[val]) {
      this.data[val] = -1
    }
  }

  findSet (val) {
    let current = val
    while (this.data[current] >= 0) {
      current = this.data[current]
    }
    return current
  }

  union (x, y) { // y to x
    let rootX = this.findSet(x)
    let rootY = this.findSet(y)
    this.data[+rootY] = rootX
  }

  // h = lg(n) like a binary tree
  smartUnion (x, y) {
    let rootX = -this.findSet(x)
    let rootY = -this.findSet(y)
    this.data[rootX] < this.data[rootY] // height or size stored in the data array
    ? this.data[rootY] = rootX : this.data[rootX] = rootY
  }

  // find complexity is O(log*(n))
  findByPathCompression (val) {
    let path = []
    let current = val
    while(this.data[current] >= 0) { // capture the case when things are not negtive
      path.push(current);
      current = this.data[current];
    }
    for (var i = 0; i < path.length; i++) {
      this.data[path[i]] = current
    }
    return current;
  }

}

module.exports = DisjointSet

// let ds = new DisjointSet()
// ds.makeSet(3)
// ds.makeSet(0)
// ds.makeSet(1)
// ds.makeSet(2)
// ds.union(3, 0)
// ds.union(1, 2)
// ds.union(1, 3)
// console.log(ds.data);
