class RangeWithControls extends HTMLElement {
    constructor() {
        super();
        let template = document.getElementById("range_with_controls");
        let templateContent = template.content;

        let clone = templateContent.cloneNode(true);

        const stylee = document.createElement('link');
        stylee.setAttribute('rel', 'stylesheet');
        stylee.setAttribute('href', 'ranger.css');

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(stylee);
        shadowRoot.appendChild(clone);
        this.setup();
    }
    setup() {
        let min = this.getAttribute("data-min");
        let max = this.getAttribute("data-max");
        let step = this.getAttribute("data-step");
        let value = this.getAttribute("data-value");
        let input = this.getInput();
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        this.setControls();
        this.setEvents();
    }
    getInput() {
        return this.query("input");
    }
    setStep(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.step = num;
        }
    }
    setMinimalValue(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.min = num;
        }
    }
    setMaximumValue(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.max = num;
        }
    }

    increase() {
        if(this.disabled){
            return;
        }
        let input = this.getInput();
        let step = Number(input.step);
        let value = Number(input.value);
        value += step;
        input.value = value;
        this.fireChange();
    }
    decrease() {
        if(this.disabled){
            return;
        }
        let input = this.getInput();
        let step = Number(input.step);
        let value = Number(input.value);
        value -= step;
        input.value = value;
        this.fireChange();
    }
    setEvents() {
        const on = "addEventListener";
        let input = this.getInput();
        input[on]("change", this.fireChange.bind(this));
        input[on]("input", this.fireChange.bind(this));
    }
    fireChange() {
        const eventor = new Event("rangechange");
        this.dispatchEvent(eventor);
    }
    setControls() {
        const on = "addEventListener";
        let plus = this.query('button.plus');
        let minus = this.query('button.minus');
        plus[on]('click', this.increase.bind(this));
        minus[on]('click', this.decrease.bind(this));
    }
    query(s) {
        return this.shadowRoot.querySelector(s);
    }
    queryAll(s) {
        return this.shadowRoot.querySelectorAll(s);
    }
    get value() {
        return this.getInput().value;
    }
    set value(_num) {
        let num = Number(_num);
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.value = num;
        }
    }
    get disabled() {
        return this.getInput().disabled;
    }
    set disabled(dis) {
        if (typeof dis === "boolean") {
            let input = this.getInput();
            input.disabled = dis;
        }
    }
}
customElements.define("ranger-wc", RangeWithControls);
Object.freeze(RangeWithControls);