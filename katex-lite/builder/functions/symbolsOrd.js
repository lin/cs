// @flow
const {defineFunctionBuilders} = require("../defineFunction");
const {buildCommon} = require("../buildCommon");
// import mathMLTree from "../mathMLTree";
//
// import * as mml from "../buildMathML";
//
// import type {ParseNode} from "../parseNode";

// "mathord" and "textord" ParseNodes created in Parser.js from symbol Groups in
// src/symbols.js.

const defaultVariant = {
    "mi": "italic",
    "mn": "normal",
    "mtext": "normal",
};

defineFunctionBuilders({
    type: "mathord",
    htmlBuilder(group, options) {
        return buildCommon.makeOrd(group, options, "mathord");
    }
});

defineFunctionBuilders({
    type: "textord",
    htmlBuilder(group, options) {
        return buildCommon.makeOrd(group, options, "textord");
    }
});
