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
        Utils.ToggleInputEnabledState("interval_range", true);
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
        Utils.ToggleInputEnabledState("keepfor_range", true);
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
    if (Utils.isNoneEmptyString(prefix)) {
        query("#naming_prefix").value = prefix;
    }

    if (Utils.isNoneEmptyString(suffix)) {
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

    if (Utils.isNoneEmptyString(format_year)) {
        query(`[data-fy='${format_year}']`).checked = true;
    }
    if (Utils.isNoneEmptyString(format_mon)) {
        query(`[data-fm='${format_mon}']`).checked = true;
    }
    if (Utils.isNoneEmptyString(format_day)) {
        query(`[data-fd='${format_day}']`).checked = true;
    }
}

// interval range functions 
const onIntervalRangeValueChange = e => query("#display_interval_range").textContent = e.target.value;

query("#interval_range")[on]("change", onIntervalRangeValueChange);
query("#interval_range")[on]("progchange", onIntervalRangeValueChange);
query("#interval_range")[on]("input", onIntervalRangeValueChange);


function ChangeRangeValue(event) {
    let targetid = event.target.getAttribute("data-target");
    let action = event.target.getAttribute("data-action");
    let targetElement = query(`#${targetid}`);
    if (targetElement.disabled) {
        return false;
    }
    let value = Number(targetElement.value);
    let step = Number(targetElement.step);
    switch (action) {
        case "minus":
            value -= step;
            break;
        case "plus":
            value += step;
            break;
        default:
            //nothing
            break;
    }
    targetElement.value = value;
    //programatically changing values does not fire change or input events
    //so we create custom event and fire on input element
    const eventor = new Event("progchange");
    targetElement.dispatchEvent(eventor);

}
//setup event listeners
const rangers = query_all("button.ranger");
for (const ranger of rangers) {
    ranger[on]("click", ChangeRangeValue);
}

// keepfor range functions
const onKeepForRangeValueChange = e => query("#display_keepfor_range").textContent = e.target.value;
query("#keepfor_range")[on]("change", onKeepForRangeValueChange);
query("#keepfor_range")[on]("progchange", onKeepForRangeValueChange);
query("#keepfor_range")[on]("input", onKeepForRangeValueChange);

const interval_inputs = query_all("input[name=interval]");
for (const input of interval_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            Utils.ToggleInputEnabledState("interval_range", true);
            return;
        }
        Utils.ToggleInputEnabledState("interval_range", false);
    })
}


const keepfor_inputs = query_all("input[name=keepfor]");
for (const input of keepfor_inputs) {
    input[on]("change", e => {
        if ("c" === e.target.value) {
            Utils.ToggleInputEnabledState("keepfor_range", true);
            return;
        }
        Utils.ToggleInputEnabledState("keepfor_range", false);
    })
}

query("#enable_sufx")[on]("click", e => {
    if (true === e.target.checked) {
        Utils.ToggleInputEnabledState("naming_suffix", true);
        return;
    }
    Utils.ToggleInputEnabledState("naming_suffix", false);
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

/**
 * 
 * @param {String} prefix 
 * @param {String} suffix
 * @returns Boolean 
 */
function ValidateAfixValues(prefix, suffix) {
    const MAXIMUM_SYMBOL_LENGTH = 32;

    if (prefix.length > MAXIMUM_SYMBOL_LENGTH) {
        alert("Preffix can not be longer than 32 symbols");
        return false;
    }
    if (suffix.length > MAXIMUM_SYMBOL_LENGTH) {
        alert("Suffix can not be longer than 32 symbols");
        return false;
    }
    return true;
}

async function SaveNaming() {
    let prefix = query("#naming_prefix").value;

    let enable_sufx = query("#enable_sufx").checked;
    let suffix = "";
    if (enable_sufx) {
        suffix = query("#naming_suffix").value;
    }

    if (!ValidateAfixValues(prefix, suffix)) {
        return;
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

//set input values from storage
browser.storage.local.get(["interval", "custom_interval"]).then(SetIntervalValues);
browser.storage.local.get(["keepfor", "custom_keepfor"]).then(SetKeepValues);
browser.storage.local.get(["prefix", "suffix"]).then(SetPrefixAndSuffix);

browser.storage.local.get(["format_year", "format_mon", "format_day"], SetFormatValues);