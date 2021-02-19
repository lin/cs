const Graph = require('./Graph')
const Queue = require('../linear/Queue')

function BFS (graph) {
  const verticeskeys = Object.keys(graph.vertices)
  for (const vertexKey of verticeskeys) {
    let vertex = graph.vertices[vertexKey]
    vertex.visited = false
    vertex.d = Infinity
  }

  for (let i = 0; i < graph.edgeList.length; i++) {
    graph.edgeList[i].visited = false
  }

  graph.componentsCount = 0
  for (const vertexKey of verticeskeys) {
    let vertex = graph.vertices[vertexKey]
    if (!vertex.visited) {
      BFS_Visit(graph, vertex)
      graph.componentsCount++
    }
  }

  return graph
}

function BFS_Visit (graph, start) {
  let q = new Queue()
  start.visited = true
  start.d = 0
  start.parent = null
  q.enqueue(start)

  // O(n)
  while (!q.isEmpty()) {
    let vertex = q.dequeue()
    let neighbors = graph.adjacentEdges(vertex.v)

    // O(m) or 2m edges: sum(degree(v_i)) = 2m
    for (var i = 0; i < neighbors.length; i++) {
      let neighbor = graph.vertices[neighbors[i]]
      let edge = graph.getEdge(neighbor.v, vertex.v)
      if (neighbor.visited == false) {
        neighbor.visited = true
        neighbor.parent = vertex.v
        neighbor.d = vertex.d + 1
        if (edge) edge.visited = "discovery"
        q.enqueue(neighbor)
      } else if (edge && edge.visited == false) {
        edge.visited = 'cross'
        graph.cycle = true
      }
    }
  }

}

module.exports = BFS
