const ptPerUnit = {
    "pt": 1,            // TeX point
    "mm": 7227 / 2540,  // millimeter
    "cm": 7227 / 254,   // centimeter
    "in": 72.27,        // inch
    "px": 803 / 800
};

const relativeUnit = {
    "ex": true, // height of an 'x' (lowercase)
    "em": true, // width of an 'M' (uppercase)
    "mu": true, // 1/18 em very small size, for mspace
};

const calculateSize = function(sizeValue, options) {
    // sizeValue = {unit: 'pt', number: 3}
    let scale;
    if (sizeValue.unit in ptPerUnit) { // this is pt mm cm in px
        // Absolute units
        let pt = ptPerUnit[sizeValue.unit]
        let em = pt / options.fontMetrics().ptPerEm

        scale = pt // Convert unit to pt
           / options.fontMetrics().ptPerEm  // Convert pt to CSS em
           / options.sizeMultiplier;        // Unscale to make absolute units
    } else if (sizeValue.unit === "mu") {
        // `mu` units scale with scriptstyle/scriptscriptstyle.
        scale = options.fontMetrics().cssEmPerMu;
    } else {
        // Other relative units always refer to the *textstyle* font
        // in the current size.
        let unitOptions;
        if (options.style.isTight()) {
            // isTight() means current style is script/scriptscript.
            unitOptions = options.havingStyle(options.style.text());
        } else {
            unitOptions = options;
        }
        // TODO: In TeX these units are relative to the quad of the current
        // *text* font, e.g. cmr10. KaTeX instead uses values from the
        // comparably-sized *Computer Modern symbol* font. At 10pt, these
        // match. At 7pt and 5pt, they differ: cmr7=1.138894, cmsy7=1.170641;
        // cmr5=1.361133, cmsy5=1.472241. Consider $\scriptsize a\kern1emb$.
        // TeX \showlists shows a kern of 1.13889 * fontsize;
        // KaTeX shows a kern of 1.171 * fontsize.
        if (sizeValue.unit === "ex") {
            scale = unitOptions.fontMetrics().xHeight;
        } else if (sizeValue.unit === "em") {
            scale = unitOptions.fontMetrics().quad;
        } else {
            // throw new ParseError("Invalid unit: '" + sizeValue.unit + "'");
        }
        if (unitOptions !== options) {
            scale *= unitOptions.sizeMultiplier / options.sizeMultiplier;
        }
    }
    return Math.min(sizeValue.number * scale, options.maxSize);
};

module.exports = {calculateSize}
