const {createClass} = require('../dom')

const canCombine = (prev, next) => {

    if (createClass(prev.classes) !== createClass(next.classes)
        || prev.skew !== next.skew
        || prev.maxFontSize !== next.maxFontSize) {
        return false;
    }

    for (const style in prev.style) {
        if (prev.style.hasOwnProperty(style)
            && prev.style[style] !== next.style[style]) {
            return false;
        }
    }

    for (const style in next.style) {
        if (next.style.hasOwnProperty(style)
            && prev.style[style] !== next.style[style]) {
            return false;
        }
    }

    return true;
};

const tryCombineChars = (chars) => {
    for (let i = 0; i < chars.length - 1; i++) {
        const prev = chars[i];
        const next = chars[i + 1];
        if (prev instanceof SymbolNode
            && next instanceof SymbolNode
            && canCombine(prev, next)) {

            prev.text += next.text;
            prev.height = Math.max(prev.height, next.height);
            prev.depth = Math.max(prev.depth, next.depth);
            prev.italic = next.italic;
            chars.splice(i + 1, 1);
            i--;
        }
    }
    return chars;
};

module.exports = {tryCombineChars}
