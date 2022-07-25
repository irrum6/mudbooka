class RadioList extends HTMLElement {
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
        this. setEvents();
    }
    query(s) {
        return this.shadowRoot.querySelector(s);
    }
    queryAll(s) {
        return this.shadowRoot.querySelectorAll(s);
    }
    build() {
        let box = this.query("div.radiobox");
        // read data
        let { names, values, inputName, inputValue } = this.readData();
        names = names.split(";");
        values = values.split(";");

        if (names.length == 0 || values.length == 0) {
            throw "one of the lists is empty";
        }

        if (names.length !== values.length) {
            throw "one of the lists is incomplete";
        }

        for (let i = 0, len = names.length; i < len; i++) {
            let name = names[i];
            let value = values[i];
            let div = document.createElement('div');
            let label = document.createElement('label');
            let span = document.createElement('span');
            span.textContent = name;
            let input = document.createElement('input');
            input.type = "radio";
            input.name = inputName;
            input.value = value;
            if (inputValue === value) {
                input.checked = true;
            }
            label.appendChild(input);
            label.appendChild(span);
            div.appendChild(label);
            box.appendChild(div);
        }
    }
    readData() {
        let names = this.getAttribute("data-names");
        let values = this.getAttribute("data-values");
        let inputValue = this.getAttribute("data-value");
        let inputName = this.getAttribute("data-name");
        return { names, values, inputName, inputValue }
    }
    setEvents() {
        const on = "addEventListener";
        let inputs = this.queryAll("input");
        for (const elem of inputs) {
            elem[on]('change', this.fireChange.bind(this));
        }
    }
    fireChange() {
        const eventor = new Event("radiochange");
        this.dispatchEvent(eventor);
    }
    get value() {
        let elem = this.query("input:checked");
        return elem.value;
    }
    /**
     * @param {String} strong
     */
    set value(strong) {
        let inputs = this.queryAll("input");
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