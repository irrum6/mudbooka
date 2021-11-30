const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

const ToggleInputEnabledState = (id, v) => {
    let elem = query(`#${id}`);
    if (true === v) {
        elem.disabled = false;
        return;
    }
    elem.disabled = true;
}