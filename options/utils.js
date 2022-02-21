const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

const Utils = (() => {
    let o = Object.create(null);
    /**
    * Enable or disable input
    * @param {String} id 
    * @param {Boolean} v
    * @void
    */
    o.ToggleInputEnabledState = (id,v) => {
        let elem = query(`#${id}`);
        if (true === v) {
            elem.disabled = false;
            return;
        }
        elem.disabled = true;
    }
    /**
    * @param {Number} entropy 
    * @param {String} radix 
    * @returns {String}
    * */
    o.GetRandomString = (entropy, radix) => {
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

    o.isString = s => typeof s === "string";

    o.isNoneEmptyString = s => (o.isString() && s !== "");

    /**
     * check if object or array contains value
     * @param {Object} list 
     * @param {any} value 
     * @returns Boolean
     */
    o.contains = (list, value) => {
        if (typeof list !== "object") {
            return false;
        }
        if (typeof list.includes === "function") {
            return list.includes(value);
        }
        if (typeof list.indexOf === "function") {
            return list.includes(value);
        }
        const keys = Object.keys(list);
        for (const k of keys) {
            if (list[k] === value) {
                return true;
            }
        }
        return false;
    }

    Object.freeze(o);
    return o;
})();