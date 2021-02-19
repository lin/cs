// @flow
import defineFunction from "../defineFunction";
import buildCommon from "../buildCommon";
import mathMLTree from "../mathMLTree";
import ParseError from "../ParseError";

import type {ParseNode} from "../parseNode";

defineFunction({
    type: "verb",
    names: ["\\verb"],
    props: {
        numArgs: 0,
        allowedInText: true,
    },
    htmlBuilder(group, options) {
        const text = makeVerb(group);
        const body = [];
        // \verb enters text mode and therefore is sized like \textstyle
        const newOptions = options.havingStyle(options.style.text());
        for (let i = 0; i < text.length; i++) {
            let c = text[i];
            if (c === '~') {
                c = '\\textasciitilde';
            }
            body.push(buildCommon.makeSymbol(c, "Typewriter-Regular",
                group.mode, newOptions, ["mord", "texttt"]));
        }
        return buildCommon.makeSpan(
            ["mord", "text"].concat(newOptions.sizingClasses(options)),
            buildCommon.tryCombineChars(body),
            newOptions,
        );
    }
});

/**
 * Converts verb group into body string.
 *
 * \verb* replaces each space with an open box \u2423
 * \verb replaces each space with a no-break space \xA0
 */
const makeVerb = (group) =>
    group.body.replace(/ /g, group.star ? '\u2423' : '\xA0');
