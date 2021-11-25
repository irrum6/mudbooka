const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

const get_input_value = input_name => query(`input[name=${input_name}]`).value;

set_interval_value = data => {
    if (undefined === data || null === data || undefined === data.interval) {
        return;
    }
    query(`[data-int='${data.interval}']`).checked = true;
}
set_keep_value = data => {
    if (undefined === data || null === data || undefined === data.keepfor) {
        return;
    }
    query(`[data-keep='${data.keepfor}']`).checked = true;
}

/**
 * Retrieves input values and sets interval and keepfor values
 * @param {Event} e 
 */
const onSetParameters = async () => {
    let interval = "1h";
    let keepfor = "2d";
    let inter = query("input[name=period]:checked");
    if (inter !== undefined && inter !== null) {
        interval = inter.value;
    }
    let keeper = query("input[name=keep]:checked");
    if (keeper !== undefined && keeper !== null) {
        keepfor = keeper.value;
    }

    await browser.storage.local.set({ interval, keepfor });
}

// runner();
query("#action")[on]("click", onSetParameters);

//set input values from storage
browser.storage.local.get("interval").then(set_interval_value)
browser.storage.local.get("keepfor").then(set_keep_value)