const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

const get_input_value = input_name => query(`input[name=${input_name}]`).value;

const set_interval_value = data => {
    if (undefined === data || null === data || undefined === data.interval) {
        return;
    }
    query(`[data-int='${data.interval}']`).checked = true;
    if ("c" === data.interval) {
        toggleIntervalRangeValueEnabledState(true);
    }
}
const set_interval_range_value = data => {
    if (undefined === data || null === data || undefined === data.custom_interval) {
        return;
    }
    query("#interval_range").value = data.custom_interval;
    query("#display_interval_range").textContent = data.custom_interval;
}

const set_keep_value = data => {
    if (undefined === data || null === data || undefined === data.keepfor) {
        return;
    }
    query(`[data-keep='${data.keepfor}']`).checked = true;
    if ("c" === data.keepfor) {
        toggleKeepForRangeValueEnabledState(true);
    }
}

const set_keepfor_range_value = data => {
    if (undefined === data || null === data || undefined === data.custom_keepfor) {
        return;
    }
    query("#keepfor_range").value = data.custom_keepfor;
    query("#display_keepfor_range").textContent = data.custom_keepfor;
}


// interval range functions 
const onIntervalRangeValueChange = e => {
    query("#display_interval_range").textContent = e.target.value;
}
query("#interval_range")[on]("change", onIntervalRangeValueChange);
query("#interval_range")[on]("input", onIntervalRangeValueChange);

const toggleIntervalRangeValueEnabledState = v => {
    if (true === v) {
        query("#interval_range").disabled = false;
        return;
    }
    query("#interval_range").disabled = true;
}

const interval_inputs = query_all("input[name=interval]");
for (const input of interval_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            toggleIntervalRangeValueEnabledState(true);
            return;
        }
        toggleIntervalRangeValueEnabledState(false);
    })
}
// keepfor range functions 
const onKeepForRangeValueChange = e => {
    query("#display_keepfor_range").textContent = e.target.value;
}
query("#keepfor_range")[on]("change", onKeepForRangeValueChange);
query("#keepfor_range")[on]("input", onKeepForRangeValueChange);

const toggleKeepForRangeValueEnabledState = v => {
    if (true === v) {
        query("#keepfor_range").disabled = false;
        return;
    }
    query("#keepfor_range").disabled = true;
}

const keepfor_inputs = query_all("input[name=keepfor]");
for (const input of keepfor_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            toggleKeepForRangeValueEnabledState(true);
            return;
        }
        toggleKeepForRangeValueEnabledState(false);
    })
}

/**
 * Retrieves input values and sets interval and keepfor values
 */
const onSetParameters = async () => {
    let interval = "1h";
    let keepfor = "2d";
    let inter = query("input[name=interval]:checked");
    if (inter !== undefined && inter !== null) {
        interval = inter.value;
    }
    let keeper = query("input[name=keepfor]:checked");
    if (keeper !== undefined && keeper !== null) {
        keepfor = keeper.value;
    }
    let custom_interval = "60";
    let custom_keepfor = "48";

    if ("c" === interval) {
        custom_interval = query("#interval_range").value;
    }
    if ("c" === keepfor) {
        custom_keepfor = query("#keepfor_range").value;
    }

    console.log(custom_interval, custom_keepfor);

    await browser.storage.local.set({ interval, keepfor, custom_interval, custom_keepfor });
}

query("#action")[on]("click", onSetParameters);

//set input values from storage
browser.storage.local.get("interval").then(set_interval_value);
browser.storage.local.get("keepfor").then(set_keep_value);
browser.storage.local.get("custom_interval").then(set_interval_range_value);
browser.storage.local.get("custom_keepfor").then(set_keepfor_range_value);