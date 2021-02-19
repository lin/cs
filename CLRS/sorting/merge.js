function mergeSorted(array1, array2) {
  let i = 0;
  let j = 0;
  let mergedArray = [];

  while (i < array1.length) {
    if (array2[j]) {
      if (array1[i] < array2[j]) {
        mergedArray.push(array1[i])
        i++
      } else {
        mergedArray.push(array2[j])
        j++
      }
    } else {
      mergedArray.push(array1[i])
      i++
    }
  }

  while (j < array2.length) {
    mergedArray.push(array2[j])
    j++
  }

  return mergedArray
}

function mergeSortRecursive (array) {
  if (array.length == 1) {
    return array
  } else {
    let halfIndex = Math.ceil(array.length / 2)
    let firstHalf = mergeSortRecursive(array.slice(0, halfIndex))
    let secondHalf = mergeSortRecursive(array.slice(halfIndex))
    return mergeSorted(firstHalf, secondHalf)
  }
}
