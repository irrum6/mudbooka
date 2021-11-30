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

const SetPrefixValue = data => {
    if (undefined === data || null === data || undefined === data.prefix) {
        return;
    }
    if (typeof data.prefix == "string" && data.prefix != "") {
        query("#enable_pfx").checked = true;
        query("#naming_prefix").disabled = false;
        query("#naming_prefix").value = data.prefix;
    }
}

const SetSuffixValue = data => {
    if (undefined === data || null === data || undefined === data.suffix) {
        return;
    }
    if (typeof data.prefix == "string" && data.suffix != "") {
        query("#enable_sufx").checked = true;
        query("#naming_suffix").disabled = false;
        query("#naming_suffix").value = data.suffix;
    }
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

query("#enable_sufx")[on]("click", e => {
    if (true === e.target.checked) {
        ToggleInputEnabledState("naming_suffix", true);
        return;
    }
    ToggleInputEnabledState("naming_suffix", false);
});
/**
 * Retrieves input values and sets interval and keepfor values
 */
const SaveIntervalValue = async () => {
    let interval = "1h";
    let inter = query("input[name=interval]:checked");
    if (inter !== undefined && inter !== null) {
        interval = inter.value;
    }
    let custom_interval = "60";
    if ("c" === interval) {
        custom_interval = query("#interval_range").value;
    }
    await browser.storage.local.set({ interval, custom_interval });
}
const SaveKeepValue = async () => {
    let keepfor = "2d";

    let keeper = query("input[name=keepfor]:checked");
    if (keeper !== undefined && keeper !== null) {
        keepfor = keeper.value;
    }

    let custom_keepfor = "48";

    if ("c" === keepfor) {
        custom_keepfor = query("#keepfor_range").value;
    }
    await browser.storage.local.set({ keepfor, custom_keepfor });
}

const SaveNaming = async () => {
    let prefix = query("#naming_prefix").value;;
    if ("" === prefix) {
        alert("prefix can't be empty");
    }
    await browser.storage.local.set({ prefix });

    let enable_sufx = query("#enable_sufx").checked;
    let suffix = "";
    if (enable_sufx) {
        suffix = query("#naming_suffix").value;
    }
    await browser.storage.local.set({ suffix });
}

query("#save_interval")[on]("click", SaveIntervalValue);
query("#save_keep")[on]("click", SaveKeepValue);
query("#save_naming")[on]("click", SaveNaming);

//set input values from storage
browser.storage.local.get("interval").then(set_interval_value);
browser.storage.local.get("keepfor").then(set_keep_value);
browser.storage.local.get("custom_interval").then(set_interval_range_value);
browser.storage.local.get("custom_keepfor").then(set_keepfor_range_value);
browser.storage.local.get("prefix").then(SetPrefixValue);
browser.storage.local.get("suffix").then(SetSuffixValue);