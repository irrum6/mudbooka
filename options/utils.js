const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

/**
 * Enable to disable input
 * @param {String} id 
 * @param {Boolean} v 
 * @void 
 */
const ToggleInputEnabledState = (id, v) => {
    let elem = query(`#${id}`);
    if (true === v) {
        elem.disabled = false;
        return;
    }
    elem.disabled = true;
}
/**
 * random string generator
 * @param {Number} entropy 
 * @param {String} radix 
 * @returns 
 */
const randa = (entropy, radix) => {
    if (typeof entropy !== "number" || !Number.isInteger(entropy)) {
        return "entropy:integer";
    }
    let valid_radixes = ["16", "36"]
    if (!valid_radixes.includes(radix)) {
        return "radix:16/36"
    }
    let arrayarra = new Uint32Array(entropy / 32);
    window.crypto.getRandomValues(arrayarra)

    return Array.prototype.map.call(arrayarra, e => e.toString(radix)).join("")
}
/**
 * check if parameter is nonempty string
 * @param {Any} s 
 * @returns {Boolean}
 */
const is_nonempty_string = s => (typeof s === "string" && s !== "");