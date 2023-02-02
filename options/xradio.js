{
    let template = document.createElement("template");
    template.id = "extended_radio";
    template.innerHTML = `
    <div>
        <label>
            <input type="radio" name="" value="">
            <span class="f3 text1"></span>
            <span class="f3 text2"></span>
        </label>
    </div>`
    document.body.appendChild(template);
}
class ExtendedRadio extends HTMLElement {
    constructor() {
        super();
        let template = document.getElementById("extended_radio");
        let templateContent = template.content;

        let clone = templateContent.cloneNode(true);

        const stylee = document.createElement('link');
        stylee.setAttribute('rel', 'stylesheet');
        stylee.setAttribute('href', 'xradio.css');

        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(stylee);
        shadowRoot.appendChild(clone);
        this.#setup();
    }
    /**
     * Private method query
     * @param {String} s
     * @returns {HTMLElement}
     */
    #q(s) {
        if (typeof s !== "string") {
            return null;
        }
        return this.shadowRoot.querySelector(s);
    }
    #setup() {
        let name = this.getAttribute("name");
        let value = this.getAttribute("value");
        let text1 = this.getAttribute("text1");
        let text2 = this.getAttribute("text2");
        this.#q(".text1").textContent = text1;
        //translate
        this.#q(".text2").textContent = browser.i18n.getMessage(text2);
        let text2class = this.getAttribute("text2class");
        if (Utils.isNoneEmptyString(text2class)) {
            this.#q(".text2").classList.remove("f3");
            this.#q(".text2").classList.add(text2class);
        }
        let input = this.#q("input");
        input.name = name;
        input.value = value;


        input.addEventListener("click", this.#on_fire.bind(this));
    }
    #retrieve_input() {
        return this.#q("input");
    }
    get name() {
        return this.#retrieve_input().name;
    }
    get value() {
        return this.#retrieve_input().value;
    }
    get checked() {
        return this.#retrieve_input().checked;
    }
    set checked(s) {
        let input = this.#retrieve_input();
        input.checked = true === s;
    }

    //make sure no other input with such name is selected
    #on_fire(e) {
        // check_exclusion
        let val = e.target.value;
        let selector = `extended-radio[name=${this.name}]`;
        let allRadios = document.body.querySelectorAll(selector);
        for (let i = 0, len = allRadios.length; i < len; i++) {
            let radio = allRadios[i];
            if (radio.value === val) {
                radio.setAttribute("checked", "checked");
                continue;
            }
            radio.checked = false;
        }
        //fire event
        this.dispatchEvent(new CustomEvent('xchanged', { bubbles: false }));
    }
}
customElements.define("extended-radio", ExtendedRadio);
Object.freeze(ExtendedRadio);