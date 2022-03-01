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
query("#keepfor_range")[on]("progchange", onKeepForRangeValueChange);
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

    // console.log(custom_interval, custom_keepfor);

    await browser.storage.local.set({ interval, keepfor, custom_interval, custom_keepfor });
}

query("#action")[on]("click", onSetParameters);

const onFullSettingsOpen = async () => {
    let createProperties = {
        url: "content/settings.html",
        active: true
    }
    await browser.tabs.create(
        createProperties
    )
}

query("#full_throtle")[on]("click", onFullSettingsOpen);

//set input values from storage
browser.storage.local.get(["interval", "custom_interval"]).then(SetIntervalValues);
browser.storage.local.get(["keepfor", "custom_keepfor"]).then(SetKeepValues);