const Graph = require('./Graph')
const Queue = require('../linear/Queue')

// Search a single node
function BFSSingleSource (graph, start) {
  // setup the stage
  let dists = {}
  let preds = {}
  let visited = []

  for (var i = 0; i < graph.vertices.length; i++) {
    let currentVertex = graph.vertices[i]
    dists[currentVertex] = currentVertex == start ? 0 : Infinity
  }

  let q = new Queue()
  q.enqueue(start)
  while(!q.isEmpty()) {
    let node = q.dequeue()
    visited.push(node)
    let neighbors = graph.adjacentEdges(node)
    for (var i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i]
      if (visited.indexOf(neighbor) == -1) { // not visited yet
        preds[neighbor] = node
        dists[neighbor] = dists[node] + 1 // increase one distance
        q.enqueue(neighbor)
      } // else if (visitedEdges.includes neighbor, node) to check cycle
    }
  }
  return {preds, dists}
}

module.exports = BFSSingleSource
