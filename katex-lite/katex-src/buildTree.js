// @flow
const {buildHTML} = require("./buildHTML");
const {buildCommon} = require("./buildCommon");
const Style = require("./Style").exportedStyles;
const {Options} = require("./Options");

const buildTree = function(
    tree
) {
    const options = new Options({ style: Style.DISPLAY , maxSize: Infinity});
    const htmlNode = buildHTML(tree, options); // tree comes from parser, and the main funciton is build HTML
    return  buildCommon.makeSpan(["katex"], [htmlNode])
};

module.exports = {buildTree}
