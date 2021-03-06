// @flow
import defineFunction from "../defineFunction";
import mathMLTree from "../mathMLTree";
import Style from "../Style";
import {sizingGroup} from "./sizing";

import * as mml from "../buildMathML";

const styleMap = {
    "display": Style.DISPLAY,
    "text": Style.TEXT,
    "script": Style.SCRIPT,
    "scriptscript": Style.SCRIPTSCRIPT,
};

defineFunction({
    type: "styling",
    names: [
        "\\displaystyle", "\\textstyle", "\\scriptstyle",
        "\\scriptscriptstyle",
    ],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    handler({breakOnTokenText, funcName, parser}, args) {
        // parse out the implicit body
        const body = parser.parseExpression(true, breakOnTokenText);

        // TODO: Refactor to avoid duplicating styleMap in multiple places (e.g.
        // here and in buildHTML and de-dupe the enumeration of all the styles).
        // $FlowFixMe: The names above exactly match the styles.
        const style = funcName.slice(1, funcName.length - 5);
        return {
            type: "styling",
            mode: parser.mode,
            // Figure out what style to use by pulling out the style from
            // the function name
            style,
            body,
        };
    },
    htmlBuilder(group, options) {
        // Style changes are handled in the TeXbook on pg. 442, Rule 3.
        const newStyle = styleMap[group.style];
        const newOptions = options.havingStyle(newStyle).withFont('');
        return sizingGroup(group.body, newOptions, options);
    }
});
