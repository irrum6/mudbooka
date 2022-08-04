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
        let min = this.getAttribute("min");
        let max = this.getAttribute("max");
        let step = this.getAttribute("step");
        let value = this.getAttribute("value");
        this.min = Number(min);
        this.max = Number(max);
        this.step = Number(step);
        this.value = Number(value);
        this.setControls();
        this.setEvents();
        this.updateDisplay();

    }
    getInput() {
        return this.query("input");
    }

    get step() {
        return this.getInput().step;
    }

    set step(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.step = num;
        }
    }

    get min() {
        return this.getInput().min;
    }

    set min(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.min = num;
        }
    }

    get max() {
        return this.getInput().max;
    }

    set max(num) {
        if (Number.isInteger(num) && num > 0) {
            let input = this.getInput();
            input.max = num;
        }
    }

    increase() {
        if (this.disabled) {
            return;
        }
        let input = this.getInput();
        let step = Number(input.step);
        let value = Number(input.value);
        let max = Number(input.max);
        if (max < value + step) {
            return;
        }
        value += step;
        input.value = value;
        this.fireChange();
    }
    decrease() {
        if (this.disabled) {
            return;
        }
        let input = this.getInput();
        let step = Number(input.step);
        let value = Number(input.value);
        let min = Number(input.min);
        if (min > value - step) {
            return;
        }
        value -= step;
        input.value = value;
        this.fireChange();
    }
    updateDisplay() {
        let value = this.value;
        let valueDisplay = this.query("span.display");
        valueDisplay.textContent = value;
    }
    setEvents() {
        const on = "addEventListener";
        let input = this.getInput();
        input[on]("change", this.fireChange.bind(this));
        input[on]("input", this.fireChange.bind(this));
    }
    fireChange() {
        this.updateDisplay();
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
        if (!Number.isInteger(num) || num <= 0) {
            return;
        }
        let input = this.getInput();
        let min = Number(input.min);
        let max = Number(input.max);
        if (max < num || min > num) {
            return;
        }
        input.value = num;
        this.updateDisplay();
    }
    isDisabled() {
        return this.getInput().disabled;
    }

    enable() {
        this.disable(false);
    }
    
    disable(dis) {
        let input = this.getInput();
        if (typeof dis === "boolean") {
            input.disabled = dis;
            return;
        }
        input.disabled = true;
    }
    get type(){
        return "rangewc" 
    }
}
customElements.define("ranger-wc", RangeWithControls);
Object.freeze(RangeWithControls);