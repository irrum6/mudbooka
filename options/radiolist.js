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

    get checked() {
        return this.getInput().checked;
    }

    set checked(value) {
        if (typeof value !== "boolean") {
            throw "not a boolean";
        }
        this.getInput().checked = value;
    }

    get text() {
        return super.query("span").textContent;
    }

    set text(strong) {
        if (typeof strong !== "string") {
            throw "not a astring"
        }
        super.query("span").textContent = strong;
    }

    get value() {
        return this.getInput().value;
    }

    set value(value) {
        if (typeof value !== "string") {
            throw "not a astring"
        }
        this.getInput().value = value;
    }
    setEvent() {
        this.getInput().addEventListener('change', this.fireChange.bind(this));
    }
    fireChange() {
        const eventor = new Event("radioItemChange");
        this.dispatchEvent(eventor);
    }

    get type() {
        return "radio";
    }
}

customElements.define("radio-item", RadioItem);
Object.freeze(RadioItem);

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