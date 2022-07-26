class AutoBookmarkerOptionsInterface {
    /**
     * query and retrieve radio value with name provided
     * @param {String} name 
     * @returns {String}
     */
    getRadioValue(name) {
        let selector = "input[name=$name$]:checked".replace("$name$", name);
        let radio = query(selector);
        if (radio !== undefined && radio !== null) {
            let ok = true;
            let value = radio.value;
            return { ok, value };
        }
        let ok = false;
        let value = null;
        return { ok, value };
    }

    onRangeValueChange(event) {
        let id = event.target.id;
        let displayid = `display_${id}`;
        let display = getbid(displayid);
        let value = event.target.value;
        display.textContent = value;
    }

    onRadioChange(event) {
        let id = event.target.id;
        let value = event.target.value;
        let rangeID = `${id}_range`;
        if ("c" === value) {
            Utils.ToggleInputEnabledState(rangeID, true);
            return;
        }
        Utils.ToggleInputEnabledState(rangeID, false);
    }

    setEvents() {
        // interval range functions
        let intrange = query("#interval_range");
        intrange[on]("rangechange", this.onRangeValueChange.bind(this));

        let interval = query("#interval");
        interval[on]("radiochange", this.onRadioChange.bind(this));
        // keepfor range functions
        let keeprange = query("#keepfor_range");
        keeprange[on]("rangechange", this.onRangeValueChange.bind(this));

        let keepfor = query("#keepfor");
        keepfor[on]("radiochange", this.onRadioChange.bind(this));
    }
}
class AutoBookmarkerOptions {
    constructor() {
        this.data = this.setDefaultData();
        this.interface = new AutoBookmarkerOptionsInterface();
    }
    setDefaultData() {
        let data = Object.create(null);
        data.interval = "";
        data.keepfor = "";
        return data;
    }

    async loadData() {
        await this.loadInterval();
        await this.loadKeepfor();
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
        query("#interval").value = interval;
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
        query("#keepfor").value = keepfor;
        if ("c" === keepfor) {
            Utils.ToggleInputEnabledState("keepfor_range", true);
        }
        if (custom_keepfor === undefined) {
            return;
        }
        query("#keepfor_range").value = custom_keepfor;
        query("#display_keepfor_range").textContent = custom_keepfor;
    }

    /**
    * Retrieves input values and sets interval and keepfor values
    */
    async saveOptions() {
        let interval = query("#interval").value;

        let custom_interval = "60";

        if ("c" === interval) {
            custom_interval = query("#interval_range").value;
        }
        await browser.storage.local.set({ interval, custom_interval });

        let keepfor = query("#keepfor").value;

        let custom_keepfor = "48";

        if ("c" === keepfor) {
            custom_keepfor = query("#keepfor_range").value;
        }
        await browser.storage.local.set({ keepfor, custom_keepfor });
    }

    async openFullSettings() {
        let createProperties = {
            url: "settings.html",
            active: true
        }
        await browser.tabs.create(
            createProperties
        )
    }

    setEvents() {
        this.interface.setEvents();
        query("#action")[on]("click", this.saveOptions.bind(this));
        query("#full_throtle")[on]("click", this.openFullSettings.bind(this));
    }
}

const options = new AutoBookmarkerOptions();
options.loadData();
options.setEvents();