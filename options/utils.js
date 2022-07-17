const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);
const val = id => document.getElementById(id).value;

const Utils = (() => {
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = SECOND * 3600;
    const DAY = HOUR * 24;

    let o = Object.create(null);
    /**
    * Enable or disable input
    * @param {String} id 
    * @param {Boolean} v
    * @void
    */
    o.ToggleInputEnabledState = (id, v) => {
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

    o.is_actual_object = s => (typeof s === "object" & s !== null);

    o.isNoneEmptyString = s => (o.isString(s) && s !== "");

    o.is_non_empty_object = s => (o.is_actual_object(s) && s !== {});

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

    /**
    * convert string value to number
    * @param {String} value 
    * @returns {Number}
    */
    o.convertInterval = (value) => {
        const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h"];
        if (!Utils.contains(VALID_INTERVALS, value)) {
            return o.convertInterval(VALID_INTERVALS[0]);
        }
        let replaced = value.replace("h", "");
        return HOUR * Number(replaced);
    }
    /**
    * convert string value to number
    * @param {String} value 
    * @returns {Number}
    */
    o.convertKeepfor = (value) => {
        const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d", "6d", "7d"];
        if (!Utils.contains(VALID_KEEPS, value)) {
            //falback to safe value
            return o.convertKeepfor(VALID_KEEPS[0]);
        }
        if ("12h" === value) {
            return HOUR * 12;
        }
        let replaced = value.replace("d", "");
        return HOUR * 24 * Number(replaced);
    }

    Object.freeze(o);
    return o;
})();