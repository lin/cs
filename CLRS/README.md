# Time Complexity

### minHeap

| Operation     | Big-O         | Notes                                |
| ------------- |:-------------:|:-------------------------------------|
| Insert        | O(log n)      |1. insert at last; 2, heapifyUp       |
| Remove        | O(log n)      |1. swap first and last; 2, heapifyDown|
| buildHeap     | O(n)          |from parent(last) to 1, heapifyDown   |
| heap sort     | O(n log n)    |1.build need n, 2, removeMin need lg n|

### Array and List

| Operation     | Array         | Linked List  |
| ------------- |:-------------:|:------------:|
| InsertFront   | O(1)*         |O(1)          |
| InsertAfter   | O(n)          |O(1)          |
| RemoveAfter   | O(n)          |O(1)          |
| Find          | O(n)          |O(n)          |
| Access        | O(1)          |O(n)          |

### Stack and Queue

Everything (create, push, pop, empty) is O(1) or O(1)*

### Hash

| Operation            | Separate Chaining  | Double Hashing|
| -------------------- |:------------------:|:-------------:|
| Insert(worst)        | O(1)               |               |
| Insert(SUHA)         | O(1)               |~O(1/(1- a))   |
| Find/Remove(worst)   | O(n)               |               |
| Find/Remove(SUHA)    | O(a)               |~O(1/(1- a))   |

### Binary Search Tree

| Operation     | BST (average / AVL) | BST (worst)  | Sorted Array | Sorted List  |
| ------------- |:-------------------:|:------------:|:------------:|:------------:|
| Find          | O(lg n)             |O(n)          |O(lg n)       |O(n)          |
| Insert        | O(lg n)             |O(n)          |O(n)          |O(n)          |
| Remove        | O(lg n)             |O(n)          |O(n)          |O(n)          |

### B-Tree

| Operation               | B-Tree         |
| ----------------------- |:--------------:|
| Search                  | O( m log_m n ) |

### Disjoint Set

| Operation               | Disjoint Set  |
| ----------------------- |:-------------:|
| Find (worst)            | O(n)          |
| Find (smart union)      | O(log n)      |
| Find (path compression) | O(log* n)     |

### Graph Representation

| Operation     | Edge List           | Adj. Matrix    | Adjacent List   |
| ------------- |:-------------------:|:--------------:|:---------------:|
| Space         | O(n + m)            |O(n^2)          |O(n + m)         |
| InsertV       | O(1)*               |O(n)            |O(1)*            |
| RemoveV       | O(m)                |O(n)            |O( deg(v) )      |
| InsertE       | 1                   |1               |1                |
| RemoveE       | 1                   |1               |1                |
| getNeighbors  | O(m)                |O(n)            |O( deg(v) )      |
| isAdjacent    | O(m)                |O(1)            |O( min deg(v) )  |

### Graph Algorithms

| Operation                            | Complexity     |
| ------------------------------------ |:--------------:|
| BFS                                  | O(n + m)       |
| DFS                                  | O(n + m)       |
| MST-Kruskal (minHeap & Sored Array)  | O(m log m)     |
| MST-Prim (Sparse)                    | O(m log m)     |
| MST-Prim (Dense)                     | O(n^2 log n)   |
| SSSP-Dijkstra                        | O(m + n log n) |
