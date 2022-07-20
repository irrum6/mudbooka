class AutoBookmarkerSettings {
    constructor() {
        this.data = this.setDefaultData();
    }
    setDefaultData() {
        let data = Object.create(null);
        data.interval = "";
        data.keepfor = "";
        let naming = Object.create(null);
        naming.prefix = "";
        naming.suffix = "";
        naming.enableSuffix = false;
        naming.fmtyear = "numeric";
        naming.fmtMonth = "numeric";
        naming.fmtDay = "numeric";
        let other = Object.create(null);
        other.folderName = "";
        data.naming = naming;
        data.other = other;
        return data;
    }

    async loadData() {
        await this.loadInterval();
        await this.loadKeepfor();
        await this.loadNaming();
        await this.loadOtherSettings();
    }

    async loadInterval() {
        let data = await browser.storage.local.get(["interval", "custom_interval"]);
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
    async loadKeepfor() {
        let data = await browser.storage.local.get(["keepfor", "custom_keepfor"]);
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
    async loadNaming() {
        let data = browser.storage.local.get(["prefix", "suffix", "format_year", "format_mon", "format_day"]);

        if (undefined === data || null === data) {
            return;
        }

        let { prefix, suffix, format_year, format_mon, format_day } = data;

        if (Utils.isNoneEmptyString(prefix)) {
            query("#naming_prefix").value = prefix;
        }

        if (Utils.isNoneEmptyString(suffix)) {
            query("#enable_sufx").checked = true;
            query("#naming_suffix").disabled = false;
            query("#naming_suffix").value = suffix;
        }

        if (Utils.isNoneEmptyString(format_year)) {
            query(`[data-fy='${format_year}']`).checked = true;
        }
        if (Utils.isNoneEmptyString(format_mon)) {
            query(`[data-fm='${format_mon}']`).checked = true;
        }
        if (Utils.isNoneEmptyString(format_day)) {
            query(`[data-fd='${format_day}']`).checked = true;
        }
        this.displayExampleName();
    }

    async loadOtherSettings() {
        let data = await browser.storage.local.get(["folder_name"]);

        if (undefined === data || null === data) {
            return;
        }

        let { folder_name } = data;
        if (Utils.isNoneEmptyString(folder_name)) {
            query("#folder_naming").value = folder_name;
        }
    }

    /**
    * Retrieves input values and sets interval and keepfor values
    */
    async saveInterval() {
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

    async saveKeepfor() {
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

    async SaveNaming() {
        let prefix = query("#naming_prefix").value;

        let enable_sufx = query("#enable_sufx").checked;
        let suffix = "";
        if (enable_sufx) {
            suffix = query("#naming_suffix").value;
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

    async SaveOtherSettings() {
        let folder_name = val("folder_naming");
        await browser.storage.local.set({ folder_name });
    }

    displayExampleName() {
        let prefix = val("naming_prefix");

        let enable_sufx = val("enable_sufx");
        let suffix = "";
        if (enable_sufx) {
            suffix = val("naming_suffix");
        }

        let year = "numeric";
        let radio = query("input[name=format_year]:checked");
        if (radio !== undefined && radio !== null) {
            year = radio.value;
        }

        let month = "numeric";
        radio = query("input[name=format_mon]:checked");
        if (radio !== undefined && radio !== null) {
            month = radio.value;
        }

        let day = "numeric";
        radio = query("input[name=format_day]:checked");
        if (radio !== undefined && radio !== null) {
            day = radio.value;
        }

        let locale = "default";
        let formatOptions = { year, month, day, hour: '2-digit', minute: '2-digit' };

        let formated = new Date().toLocaleString(locale, formatOptions).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
        let title = `${formated}`
        if (Utils.isNoneEmptyString(prefix)) {
            title = `${prefix}${title}`;
        }
        if (Utils.isNoneEmptyString(suffix)) {
            title = `${title}${suffix}`;
        }
        query("#display_name_example").textContent = title;
    }

    changeRangeValue(event) {
        debugger;
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

    // interval interface 
    updateIntervalRangeValue(value) {
        let display = query("#display_interval_range");
        display.textContent = value;
    }
    onIntervalRangeValueChange(e) {
        let val = e.target.value;
        this.updateIntervalRangeValue(val);
    }
    setIntervalEvents() {
        let intervaRangeElement = query("#interval_range");
        intervaRangeElement[on]("change", this.onIntervalRangeValueChange.bind(this));
        intervaRangeElement[on]("progchange", this.onIntervalRangeValueChange.bind(this));
        intervaRangeElement[on]("input", this.onIntervalRangeValueChange.bind(this));

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
    }
    // keepfor interface 
    updateKeepforRangeValue(value) {
        let display = query("#display_keepfor_range");
        display.textContent = value;
    }
    onKeepforRangeValueChange(e) {
        let val = e.target.value;
        this.updateKeepforRangeValue(val);
    }
    setKeepforEvents() {
        // keepfor range functions
        let element = query("#keepfor_range");
        element[on]("change", this.onKeepforRangeValueChange.bind(this));
        element[on]("progchange", this.onKeepforRangeValueChange.bind(this));
        element[on]("input", this.onKeepforRangeValueChange.bind(this));

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
    }
    setRangeButtons() {
        const rangers = query_all("button.ranger");
        for (const ranger of rangers) {
            ranger[on]("click", this.changeRangeValue);
        }
    }

    setEvents() {
        this.setIntervalEvents();
        this.setKeepforEvents();
        this.setRangeButtons();
        query("#save_interval")[on]("click", this.saveInterval.bind(this));
        query("#save_keep")[on]("click", this.saveKeepfor.bind(this));
        query("#save_naming")[on]("click", this.SaveNaming.bind(this));
        query("#save_other")[on]("click", this.SaveOtherSettings.bind(this));

        const dxn_bound = this.displayExampleName.bind(this);
        // setup event listeners for prefix/suffix inputs
        query("#naming_prefix")[on]("change", dxn_bound);
        query("#naming_prefix")[on]("input", dxn_bound);
        query("#naming_prefix")[on]("keydown", dxn_bound);

        query("#naming_suffix")[on]("change", dxn_bound);
        query("#naming_suffix")[on]("input", dxn_bound);
        query("#naming_suffix")[on]("keydown", dxn_bound);


        // setup event listeners for date format inputs
        // try generic query
        let fy = query_all("[name=format_year]");
        let fm = query_all("[name=format_mon]");
        let fd = query_all("[name=format_day]");
        let fullSet = new Set([...fy, ...fm, ...fd]);

        for (const elem of fullSet) {
            elem[on]("click", dxn_bound);
            elem[on]("focus", dxn_bound);
            elem[on]("change", dxn_bound);
            elem[on]("input", dxn_bound);
        }

        query("#enable_sufx")[on]("click", e => {
            if (true === e.target.checked) {
                Utils.ToggleInputEnabledState("naming_suffix", true);
                return;
            }
            Utils.ToggleInputEnabledState("naming_suffix", false);
        });
    }
}



const settings = new AutoBookmarkerSettings();
settings.loadData();
settings.setEvents();