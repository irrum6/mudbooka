function SetIntervalValues(data) {
    if (undefined === data || null === data) {
        return;
    }
    const { interval, custom_interval } = data;
    if (interval === undefined) {
        return;
    }
    query(`[data-int='${interval}']`).checked = true;
    if ("c" === interval) {
        ToggleInputEnabledState("interval_range", true);
    }
    if (custom_interval === undefined) {
        return;
    }
    query("#interval_range").value = custom_interval;
    query("#display_interval_range").textContent = custom_interval;
}

function SetKeepValues(data) {
    if (undefined === data || null === data) {
        return;
    }
    const { keepfor, custom_keepfor } = data;
    if (keepfor === undefined) {
        return;
    }
    query(`[data-keep='${keepfor}']`).checked = true;
    if ("c" === keepfor) {
        ToggleInputEnabledState("keepfor_range", true);
    }
    if (custom_keepfor === undefined) {
        return;
    }
    query("#keepfor_range").value = custom_keepfor;
    query("#display_keepfor_range").textContent = custom_keepfor;
}

function SetPrefixAndSuffix(data) {
    if (undefined === data || null === data) {
        return;
    }
    const { prefix, suffix } = data;
    query("#naming_prefix").value = prefix;

    if (is_nonempty_string(suffix)) {
        query("#enable_sufx").checked = true;
        query("#naming_suffix").disabled = false;
        query("#naming_suffix").value = suffix;
    }
}

function SetFormatValues(data) {
    if (undefined === data || null === data) {
        return;
    }

    let { format_year, format_mon, format_day, locale } = data;

    if (is_nonempty_string(format_year)) {
        query(`[data-fy='${format_year}']`).checked = true;
    }
    if (is_nonempty_string(format_mon)) {
        query(`[data-fm='${format_mon}']`).checked = true;
    }
    if (is_nonempty_string(format_day)) {
        query(`[data-fd='${format_day}']`).checked = true;
    }
}

// interval range functions 
const onIntervalRangeValueChange = e => query("#display_interval_range").textContent = e.target.value;

query("#interval_range")[on]("change", onIntervalRangeValueChange);
query("#interval_range")[on]("input", onIntervalRangeValueChange);

// keepfor range functions
const onKeepForRangeValueChange = e => query("#display_keepfor_range").textContent = e.target.value;
query("#keepfor_range")[on]("change", onKeepForRangeValueChange);
query("#keepfor_range")[on]("input", onKeepForRangeValueChange);

const interval_inputs = query_all("input[name=interval]");
for (const input of interval_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            ToggleInputEnabledState("interval_range", true);
            return;
        }
        ToggleInputEnabledState("interval_range", false);
    })
}


const keepfor_inputs = query_all("input[name=keepfor]");
for (const input of keepfor_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            ToggleInputEnabledState("keepfor_range", true);
            return;
        }
        ToggleInputEnabledState("keepfor_range", false);
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
async function SaveIntervalValue() {
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
async function SaveKeepValue() {
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

async function SaveNaming() {
    let prefix = query("#naming_prefix").value;

    let enable_sufx = query("#enable_sufx").checked;
    let suffix = "";
    if (enable_sufx) {
        suffix = query("#naming_suffix").value;
    }

    if ("" === prefix && "" === suffix) {
        alert("prefix and suffix can't be empty same time");
        return;
    }

    if ("" === prefix && suffix.length < 3) {
        alert("suffix shall be at least 3 symbols");
    }
    if ("" !== prefix && prefix.length < 3) {
        alert("prefix shall be at least 3 symbols");
    }

    await browser.storage.local.set({ prefix, suffix });

    let format_year = "numeric";
    let radio = query("input[name=format_year]:checked");
    if (radio !== undefined && radio !== null) {
        format_year = radio.value;
    }
    await browser.storage.local.set({ format_year });

    let format_mon = "numeric";
    radio = query("input[name=format_mon]:checked");
    if (radio !== undefined && radio !== null) {
        format_mon = radio.value;
    }
    await browser.storage.local.set({ format_mon });

    let format_day = "numeric";
    radio = query("input[name=format_day]:checked");
    if (radio !== undefined && radio !== null) {
        format_day = radio.value;
    }
    await browser.storage.local.set({ format_day });

}

query("#save_interval")[on]("click", SaveIntervalValue);
query("#save_keep")[on]("click", SaveKeepValue);
query("#save_naming")[on]("click", SaveNaming);

const OpenLocaleSelector = () => {
    query("div#locale-selector").style.display = 'block';
};
//set input values from storage
browser.storage.local.get(["interval", "custom_interval"]).then(SetIntervalValues);
browser.storage.local.get(["keepfor", "custom_keepfor"]).then(SetKeepValues);
browser.storage.local.get(["prefix", "suffix"]).then(SetPrefixAndSuffix);

browser.storage.local.get(["format_year", "format_mon", "format_day"], SetFormatValues);