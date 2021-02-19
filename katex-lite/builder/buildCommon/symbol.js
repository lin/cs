const {getCharacterMetrics} = require("./fontMetrics")
const {symbols} = require("./symbols")

const lookupSymbol = function (value, fontName, mode) {
    // Replace the value with its replaced value from symbol.js
    if (symbols[mode][value] && symbols[mode][value].replace) {
        value = symbols[mode][value].replace;
    }
    return {
        value: value,
        // Which symbol? Using what font? In what mode?
        metrics: getCharacterMetrics(value, fontName, mode)
    }
}

const makeSymbol = function (value, fontName, mode, options, classes) {
    const lookupResult = lookupSymbol(value, fontName, mode);
    const metrics = lookupResult.metrics;
    value = lookupResult.value;

    let symbolNode;

    if (metrics) {
        let italic = metrics.italic;
        if (mode === "text" || (options && options.font === "mathit")) {
            italic = 0;
        }
        symbolNode = new SymbolNode(
            value, metrics.height, metrics.depth, italic, metrics.skew,
            metrics.width, classes);
    } else {
        // TODO(emily): Figure out a good way to only print this in development
        typeof console !== "undefined" && console.warn(
            "No character metrics for '" + value + "' in style '" +
                fontName + "'");
        symbolNode = new SymbolNode(value, 0, 0, 0, 0, 0, classes);
    }

    if (options) {
        symbolNode.maxFontSize = options.sizeMultiplier;
        if (options.style.isTight()) {
            symbolNode.classes.push("mtight");
        }
        const color = options.getColor();
        if (color) {
            symbolNode.style.color = color;
        }
    }

    return symbolNode;
}

// only main-bold or ams-regular
// special for \ as main-regular
const mathsym = function(value, mode, options, classes = []) {
    if (
      (options && options.font && options.font === "boldsymbol")
      && lookupSymbol(value, "Main-Bold", mode).metrics
    ) {
        return makeSymbol(value, "Main-Bold", mode, options,
            classes.concat(["mathbf"]));
    } else if (value === "\\" || symbols[mode][value].font === "main") {
        return makeSymbol(value, "Main-Regular", mode, options, classes);
    } else {
        return makeSymbol(
            value, "AMS-Regular", mode, options, classes.concat(["amsrm"]));
    }
}

module.exports = {lookupSymbol, makeSymbol, mathsym}
