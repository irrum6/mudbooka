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



const format_options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };

//const but mutable
//config for program
const config = {
    prefix: "tabs_",
    prefixes: ["tabs_"],
    suffix: "",
    suffixes: [],
    format_options,
    locale: "default",
    debuging: false,
    debug_entropy: 64,
    debug_random_radix: "16",
    interval: HOUR * 1,
    keepfor: DAY * 2
};
// process data
const pdata = {
    last_time: 0,
    next_time: 0
};

/**
 * @param {String} psx //prefix or suffix
 * @param {Number} keep 
 */
async function search_and_destroy_old_folders(psx, keep) {
    //delete old items
    let folders = await browser.bookmarks.search({ query: psx });
    let early_date = new Date(Date.now() - keep);
    for (const fold of folders) {
        if (fold.dateAdded < early_date) {
            console.log(`DELETE:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);

        }
    }
}
async function runner() {

    //take care of old stuff
    while (config.prefixes.length > 1) {
        let prefix = config.prefixes.shift();
        await search_and_destroy_old_folders(prefix, config.keepfor);
    }
    while (config.suffixes.length > 1) {
        let suffix = config.suffixes.shift();
        await search_and_destroy_old_folders(suffix, config.keepfor);
    }

    if (Utils.isNoneEmptyString(config.prefix)) {
        await search_and_destroy_old_folders(config.prefix, config.keepfor);
    }

    if (Utils.isNoneEmptyString(config.suffix)) {
        await search_and_destroy_old_folders(config.suffix, config.keepfor);
    }

    //search tabs
    let tabs = await browser.tabs.query({});

    let formated = new Date().toLocaleString(config.locale, config.format_options).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
    //fix undefined prefix/suffix bug , caused of which is not determined yet (on loading/set naming bug might be)
    let title = `${formated}`
    if (Utils.isNoneEmptyString(config.prefix)) {
        title = `${config.prefix}${title}`;
    }
    if (Utils.isNoneEmptyString(config.suffix)) {
        title = `${title}${config.suffix}`;
    }

    if (config.debuging) {
        //add some randomness
        let _substr = `_${Utils.GetRandomString(config.debug_entropy, config.debug_random_radix)}`;
        title = title.concat(_substr);
    }
    let folder = await browser.bookmarks.create({ title });

    const folder_id = folder.id;

    //save tabs to folder
    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }
    pdata.last_time = Date.now();
    pdata.next_time = pdata.last_time + config.interval;

    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.runtime.getURL("icons/logo.png"),
        "title": "MudBooker",
        "message": "Tabs were bookmarked"
    });

    await browser.storage.local.set({ last: pdata.last_time, next: pdata.next_time });
}
/**
 * @param {Object} pdata 
 * @returns {void}
 */
async function load_and_set_interval(pdata) {
    if (config.debuging) {
        return;
    }
    let data = await browser.storage.local.get(["interval", "custom_interval"]);
    if (undefined === data || null === data) {
        return;
    }
    const parse_interval_range = value => MINUTE * Number(value);

    let { interval, custom_interval } = data;
    if ("c" === interval) {
        interval = parse_interval_range(custom_interval);
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

async function load_and_set_keepfor() {
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

async function load_and_set_naming() {
    let sarraya = ["prefix", "suffix", "format_year", "format_mon", "format_day"];

    let data = await browser.storage.local.get(sarraya);

    if (undefined === data || null === data) {
        return;
    }
    let { prefix, suffix, format_year, format_mon, format_day } = data;

    config.prefix = prefix;
    if (Utils.isNoneEmptyString(prefix)) {
        config.prefixes.push(prefix);
    }
    config.suffix = suffix;
    if (Utils.isNoneEmptyString(suffix)) {
        config.suffixes.push(suffix);
    }
    if (Utils.isNoneEmptyString(format_year)) {
        config.format_options.year = format_year;
    }
    if (Utils.isNoneEmptyString(format_mon)) {
        config.format_options.month = format_mon;
    }
    if (Utils.isNoneEmptyString(format_day)) {
        config.format_options.day = format_day;
    }
}

pdata.runner_id = window.setInterval(runner, config.interval);

window.setTimeout(async () => {
    // load and set interval
    await load_and_set_interval(pdata);
    //load and set keepfor
    await load_and_set_keepfor();
    // load and set prefix/suffix
    await load_and_set_naming();
    runner();
}, 2000);

browser.storage.onChanged.addListener(async () => {
    // load and set interval
    await load_and_set_interval(pdata);
    //load and set keepfor
    await load_and_set_keepfor();
    // load and set prefix/suffix
    await load_and_set_naming();
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command == "tuesday") {
        window.clearInterval(pdata.runner_id);
        pdata.runner_id = window.setInterval(runner, config.interval);
        runner();
    }
});