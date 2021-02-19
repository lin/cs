// @flow
const {defineFunctionBuilders} = require("../defineFunction");
const {buildCommon} = require("../buildCommon");

// Operator ParseNodes created in Parser.js from symbol Groups in src/symbols.js.

defineFunctionBuilders({
    type: "atom",
    htmlBuilder(group, options) {
        return buildCommon.mathsym(
            group.text, group.mode, options, ["m" + group.family]);
    }
});
