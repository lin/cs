const sizeElementFromChildren = function(elem) {
    let height = 0;
    let depth = 0;
    let maxFontSize = 0;

    for (let i = 0; i < elem.children.length; i++) {
        const child = elem.children[i];
        if (child.height > height) {
            height = child.height;
        }
        if (child.depth > depth) {
            depth = child.depth;
        }
        if (child.maxFontSize > maxFontSize) {
            maxFontSize = child.maxFontSize;
        }
    }

    elem.height = height;
    elem.depth = depth;
    elem.maxFontSize = maxFontSize;
}

module.exports = sizeElementFromChildren
