const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

/**
 * convert string value to number
 * @param {String} value 
 * @returns {Number}
 */
function input_to_interval(value) {
    const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h"];
    if (!Utils.contains(VALID_INTERVALS, value)) {
        return input_to_interval(VALID_INTERVALS[0]);
    }
    let replaced = value.replace("h", "");
    return HOUR * Number(replaced);;
}

/**
 * convert string value to number
 * @param {String} value 
 * @returns {Number}
 */
function input_to_keepfor(value) {
    const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d", "6d", "7d"];
    if (!Utils.contains(VALID_KEEPS, value)) {
        //falback to safe value
        return input_to_keepfor(VALID_KEEPS[0]);
    }
    if ("12h" === value) {
        return HOUR * 12;
    }
    let replaced = value.replace("d", "");
    return HOUR * 24 * Number(replaced);
}

/** 
 * @param {Array<String>} idsArray 
 * @param {Number} keep
 * @returns {Array<String>} 
 */
async function delete_old_folders(idsArray, keep) {
    let earlyDate = new Date(Date.now() - keep);
    const clearIds = [];
    /**
     * yes i know that i can pass array as whole
     * but if one of the folders is deleted , then whole get operation will fail due to invalid id.
     */
    for (const id of idsArray) {
        if (!Utils.isNoneEmptyString(id)) {
            continue;
        }
        let fold = null;
        try {
            let data = await browser.bookmarks.get(id);
            fold = data[0];
        } catch (e) {
            console.log("Folder by id not found");
        }
        if (!Utils.is_non_empty_object(fold)) {
            continue;
        }
        if (fold.dateAdded < earlyDate) {
            console.log(`Now deleting:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);
            continue;
        }
        clearIds.push(id);
    }
    return clearIds;
}

/**
 * @param {Object} pdata 
 * @returns {void}
 */
async function load_and_set_interval(pdata, config) {
    if (config.debuging) {
        return;
    }
    let data = await browser.storage.local.get(["interval", "custom_interval"]);
    if (undefined === data || null === data) {
        return;
    }

    let { interval, custom_interval } = data;
    if ("c" === interval) {
        let intervalRangeParsed = MINUTE * custom_interval
        interval = intervalRangeParsed;
    } else {
        interval = input_to_interval(interval);
    }
    //if interval was changed
    if (interval != config.interval) {
        window.clearInterval(pdata.runner_id);
        pdata.runner_id = window.setInterval(runner, interval);
        config.interval = interval;
        runner();
    }
}

/** 
 * @param {Object} config 
 * @returns 
 */
async function load_and_set_keepfor(config) {
    if (config.debuging) {
        return;
    }
    let data = await browser.storage.local.get(["keepfor", "custom_keepfor"]);
    if (undefined === data || null === data) {
        return;
    }
    const parse_keepfor_range = value => HOUR * Number(value);

    let { keepfor, custom_keepfor } = data;
    if ("c" === keepfor) {
        config.keepfor = parse_keepfor_range(custom_keepfor);
    } else {
        config.keepfor = input_to_keepfor(keepfor);
    }
}

/** 
 * @param {Object} config 
 * @returns 
 */
async function load_and_set_naming(config) {
    let sarraya = ["prefix", "suffix", "format_year", "format_mon", "format_day"];

    let data = await browser.storage.local.get(sarraya);

    if (undefined === data || null === data) {
        return;
    }
    let { prefix, suffix, format_year, format_mon, format_day } = data;

    if (Utils.isString(prefix)) {
        config.prefix = prefix;
    }
    if (Utils.isString(suffix)) {
        config.suffix = suffix;
    }

    if (Utils.isNoneEmptyString(format_year)) {
        config.formatOptions.year = format_year;
    }
    if (Utils.isNoneEmptyString(format_mon)) {
        config.formatOptions.month = format_mon;
    }
    if (Utils.isNoneEmptyString(format_day)) {
        config.formatOptions.day = format_day;
    }
}

// main
const formatOptions = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };

//const but mutable
//config for program
const config = {
    prefix: "",
    suffix: "_tabs",
    formatOptions,
    locale: "default",
    debuging: false,
    debugEntropy: 64,
    debugRandomRadix: "16",
    interval: HOUR * 1,
    keepfor: DAY * 2
};
// process data
const pdata = {
    last_time: 0,
    next_time: 0
};

async function runner() {
    let getSavedTabs = await browser.storage.local.get("saved_tabs");
    let savedTabs = getSavedTabs["saved_tabs"];

    let folderIds = [];
    if (Utils.is_non_empty_object(savedTabs) && savedTabs.folderIds) {
        folderIds = await delete_old_folders(savedTabs.folderIds, config.keepfor);
    }

    //search tabs
    let tabs = await browser.tabs.query({});

    let { locale, formatOptions, prefix, suffix, debuging, debugEntropy, debugRandomRadix } = config;

    let formated = new Date().toLocaleString(locale, formatOptions).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
    //fix undefined prefix/suffix bug , caused of which is not determined yet (on loading/set naming bug might be)
    let title = `${formated}`
    if (Utils.isNoneEmptyString(prefix)) {
        title = `${config.prefix}${title}`;
    }
    if (Utils.isNoneEmptyString(suffix)) {
        title = `${title}${config.suffix}`;
    }

    if (config.debuging) {
        //add some randomness
        let _substr = `_${Utils.GetRandomString(debugEntropy, debugRandomRadix)}`;
        title = title.concat(_substr);
    }
    let folder = await browser.bookmarks.create({ title });

    const folder_id = folder.id;

    //save tabs to folder
    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }

    folderIds.push(folder_id);

    pdata.last_time = Date.now();
    pdata.next_time = pdata.last_time + config.interval;

    const saved_tabs = { folderIds }
    await browser.storage.local.set({ saved_tabs });

    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.runtime.getURL("icons/logo.png"),
        "title": "MudBooker",
        "message": "Tabs were bookmarked"
    });

    await browser.storage.local.set({ last: pdata.last_time, next: pdata.next_time });
}

pdata.runner_id = window.setInterval(runner, config.interval);

window.setTimeout(async () => {
    await load_and_set_interval(pdata, config);
    await load_and_set_keepfor(config);
    await load_and_set_naming(config);
    runner();
}, 2000);

browser.storage.onChanged.addListener(async () => {
    await load_and_set_interval(pdata, config);
    await load_and_set_keepfor(config);
    await load_and_set_naming(config);
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command == "tuesday") {
        window.clearInterval(pdata.runner_id);
        pdata.runner_id = window.setInterval(runner, config.interval);
        runner();
    }
});