const Graph = require('./Graph')
const Queue = require('../linear/Queue')

function DFS (graph) {
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
      vertex.d = 0
      vertex.parent = null
      DFS_Visit(graph, vertex)
      graph.componentsCount++
    }
  }

  return graph
}

function DFS_Visit (graph, vertex) {
  vertex.visited = true

  // O(n)
  let neighbors = graph.adjacentEdges(vertex.v)

  // O(m) or 2m edges: sum(degree(v_i)) = 2m
  for (var i = 0; i < neighbors.length; i++) {
    let neighbor = graph.vertices[neighbors[i]]
    let edge = graph.getEdge(neighbor.v, vertex.v)
    if (neighbor.visited == false) {
      neighbor.parent = vertex.v
      neighbor.d = vertex.d + 1
      if (edge) edge.visited = "discovery"
      DFS_Visit(graph, neighbor)
    } else if (edge && edge.visited == false) {
      edge.visited = 'back'
      graph.cycle = true
    }
  }

}

module.exports = DFS
