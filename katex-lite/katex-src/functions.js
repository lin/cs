// @flow
/** Include this to ensure that all functions are defined. */
let _functions = require("./defineFunction")._functions;

const functions = _functions;

// TODO(kevinb): have functions return an object and call defineFunction with
// that object in this file instead of relying on side-effects.
// require("./functions/accent";
// require("./functions/accentunder";
// require("./functions/arrow";
require("./functions/char").char;
// require("./functions/color";
// require("./functions/cr";
// require("./functions/delimsizing";
// require("./functions/enclose";
// require("./functions/environment";
// require("./functions/font";
// require("./functions/genfrac";
// require("./functions/horizBrace";
// require("./functions/href";
// require("./functions/htmlmathml";
// Disabled until https://github.com/KaTeX/KaTeX/pull/1794 is merged.
// require("./functions/includegraphics";
// require("./functions/kern";
// require("./functions/lap";
// const {math} = require("./functions/math");
// require("./functions/mathchoice";
// require("./functions/mclass";
// require("./functions/op";
// require("./functions/operatorname";
// require("./functions/ordgroup";
// require("./functions/overline";
// require("./functions/phantom";
// require("./functions/raisebox";
// require("./functions/rule";
// require("./functions/sizing";
// require("./functions/smash";
// require("./functions/sqrt";
// require("./functions/styling";
// require("./functions/supsub";
require("./functions/symbolsOp");
require("./functions/symbolsOrd");
// require("./functions/symbolsSpacing";
// require("./functions/tag";
// require("./functions/text";
// require("./functions/underline";
// require("./functions/verb";

module.exports = {functions};
