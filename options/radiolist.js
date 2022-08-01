class CommonTemplate extends HTMLElement {
    constructor() {
        super();
    }
    query(s) {
        return this.shadowRoot.querySelector(s);
    }
    queryAll(s) {
        return this.shadowRoot.querySelectorAll(s);
    }
}
class RadioItem extends CommonTemplate {
    constructor() {
        super();
        let template = document.getElementById("radioitem");
        let templateContent = template.content;

        let clone = templateContent.cloneNode(true);

        const stylee = document.createElement('link');
        stylee.setAttribute('rel', 'stylesheet');
        stylee.setAttribute('href', 'radiolist.css');

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(stylee);
        shadowRoot.appendChild(clone);
        this.setEvent();
    }
    getInput() {
        return super.query("input");
    }
    /**
     * @returns {boolean} if item is checked
     */
    get checked() {
        let input = this.getInput();
        return input.checked;
    }
    /**
     * @param {boolean} value
     * @returns {boolean}
     */
    set checked(value) {
        if (typeof value !== "boolean") {
            return false;
        }
        let input = this.getInput();
        input.checked = value;
        return true;
    }
    /**
     * @returns {string}
     */
    get text() {
        let span = super.query("span");
        return span.textContent;
    }
    /**
     * @param {string} strong
     * @returns {boolean}
     */
    set text(strong) {
        if (typeof strong !== "string") {
            return false;
        }
        let span = super.query("span");
        span.textContent = strong;
        return true;
    }
    /**
     * @returns {boolean} if item is checked
     */
    get value() {
        let input = this.getInput();
        return input.value;
    }
    /**
     * @param {boolean} value
     * @returns {boolean}
     */
    set value(value) {
        if (typeof value !== "string") {
            return false;
        }
        let input = this.getInput();
        input.value = value;
        return true;
    }
    setEvent() {
        let input = this.getInput();
        const on = "addEventListener";
        input[on]('change', this.fireChange.bind(this));
    }
    fireChange() {
        const eventor = new Event("radioItemChange");
        this.dispatchEvent(eventor);
    }
    /**
     * @returns {string}
     */
    get type() {
        return "radio";
    }
}

customElements.define("radio-item", RadioItem);
Object.freeze(RadioItem);
//<radio-itemwr data-wrmin="3" data-wrmax="168" data-wrstep="3" data-wrvalue="48" ></radio-itemwr>
class RadioItemWithRange extends CommonTemplate {
    constructor() {
        super();
    }
    build() {

    }
    getRadio() {
        return super.query("radio-item");
    }
    getRangeInput() {
        return super.query("ranger-wc");
    }

    get value() {
        return this.getRadio().value;
    }
    set value(num) {
        this.getRadio().value = num;
    }

    get values() {
        let radio = this.getRadio();
        let value = radio.value;
        let ranger = this.getRangeInput();
        let rangeValue = ranger.value;
        return { value, rangeValue };
    }

    set values(vals) {
        let { value, rangeValue } = val;
        let radio = this.getRadio();
        radio.value = value;
        let ranger = this.getRangeInput();
        ranger.value = rangeValue;
    }

    get range() {
        let ranger = this.getRangeInput();
        let value = ranger.value;
        let min = ranger.min;
        let max = ranger.max;
        let step = ranger.step;
        return { min, max, step, value };
    }
    set range(ra) {
        let { min, max, step, value } = ra;
        let ranger = this.getRangeInput();
        ranger.value = value;
        ranger.min = min;
        ranger.max = max;
        ranger.step = step;
    }

    get rangeValue() {
        return this.getRangeInput().value;
    }

    set rangeValue(num) {
        this.getRangeInput().value = num;
    }
    /**
     * @returns {string}
     */
    get type() {
        return "radio-range";
    }
}
// <radio-list data-itemtypes="8:RR;"></radio-list>
class RadioList extends CommonTemplate {
    constructor() {
        super();
        let template = document.getElementById("radiolist");
        let templateContent = template.content;

        let clone = templateContent.cloneNode(true);

        const stylee = document.createElement('link');
        stylee.setAttribute('rel', 'stylesheet');
        stylee.setAttribute('href', 'radiolist.css');

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(stylee);
        shadowRoot.appendChild(clone);
        this.build();
        this.setEvents();
    }
    build() {
        let { names, values, inputValue } = this.readData();
        let box = super.query("div.radiobox");
        for (let i = 0, len = names.length; i < len; i++) {
            let name = names[i];
            let value = values[i];
            let radio = document.createElement('radio-item');
            radio.text = name;
            radio.value = value;
            radio.checked = false;
            if (inputValue === value) {
                radio.checked = true;
            }
            box.appendChild(radio);
        }
    }
    readData() {
        let radiosdata = this.getAttribute("data-radios");
        let dataStrings = radiosdata.split(";")

        let names = [], values = [];

        for (const datastr of dataStrings) {
            let dataSplit = datastr.split("=>");
            if (dataSplit.length !== 2) {
                throw "bad data";
            }
            let name = dataSplit[0];
            let value = dataSplit[1];
            names.push(name);
            values.push(value);
        }

        let inputValue = this.getAttribute("data-value");

        if (names.length == 0 || values.length == 0) {
            throw "one of the lists is empty";
        }

        if (names.length !== values.length) {
            throw "one of the lists is incomplete";
        }
        return { names, values, inputValue };
    }
    setEvents() {
        const on = "addEventListener";
        let inputs = super.queryAll("radio-item");
        for (const elem of inputs) {
            elem[on]('radioItemChange', this.fireChange.bind(this));
        }
    }
    fireChange(event) {
        let value = event.target.value;
        let inputs = super.queryAll("radio-item");
        for (const elem of inputs) {
            if (elem.value === value) {
                elem.checked = true;
                continue;
            }
            elem.checked = false;
        }
        const eventor = new Event("radiochange");
        this.dispatchEvent(eventor);
    }
    get value() {
        let inputs = super.queryAll("radio-item");
        for (const elem of inputs) {
            if (elem.checked == true) {
                return elem.value;
            }
        }
        //default zeroth element
        return inputs[0].value;
    }
    /**
     * @param {String} strong
     */
    set value(strong) {
        let inputs = super.queryAll("radio-item");
        for (const elem of inputs) {
            if (elem.value === strong) {
                elem.checked = true;
                continue;
            }
            elem.checked = false;
        }
    }
}
customElements.define("radio-list", RadioList);
Object.freeze(RadioList);