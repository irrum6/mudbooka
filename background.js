const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

const input_to_interval = value => {
    const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h"];
    if (!VALID_INTERVALS.includes(value)) {
        return input_to_interval(VALID_INTERVALS[0]);
    }
    let replaced = value.replace("h", "");
    return HOUR * Number(replaced);;
}

const parse_interval_range = value => MINUTE * Number(value);

const input_to_keepfor = value => {
    const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d", "6d", "7d"];
    if (!VALID_KEEPS.includes(value)) {
        //falback to safe value
        return input_to_keepfor(VALID_KEEPS[0]);
    }
    if ("12h" === value) {
        return HOUR * 12;
    }
    let replaced = value.replace("d", "");
    return HOUR * 24 * Number(replaced);
}

const parse_keepfor_range = value => HOUR * Number(value);

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

const search_and_destroy_old_folders = async (prefix, keep) => {
    //delete old items
    let folders = await browser.bookmarks.search({ query: prefix });
    let early_date = new Date(Date.now() - keep);
    for (const fold of folders) {
        if (fold.dateAdded < early_date) {
            console.log(`DELETE:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);

        }
    }
}
let runner = async () => {

    while (config.prefixes.length > 1) {
        let prefix = config.prefixes.shift();
        await search_and_destroy_old_folders(prefix, config.keepfor);
    }

    await search_and_destroy_old_folders(config.prefix, config.keepfor);

    //search tabs
    let tabs = await browser.tabs.query({});

    let formated = new Date().toLocaleString(config.locale, config.format_options).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
    let title = `${config.prefix}${formated}${config.suffix}`;

    if (config.debuging) {
        //add some randomness
        let _substr = `_${randa(config.debug_entropy, config.debug_random_radix)}`;
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
 * 
 * @param {ProcessData} pdata 
 * @returns 
 */
const load_and_set_interval = async pdata => {
    if (config.debuging) {
        return;
    }
    let data = await browser.storage.local.get(["interval", "custom_interval"]);
    if (undefined === data || null === data) {
        return;
    }

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

const load_and_set_keepfor = async () => {
    if (config.debuging) {
        return;
    }
    let data = await browser.storage.local.get(["keepfor", "custom_keepfor"]);
    if (undefined === data || null === data) {
        return;
    }

    let { keepfor, custom_keepfor } = data;
    if ("c" === keepfor) {
        config.keepfor = parse_keepfor_range(custom_keepfor);
    } else {
        config.keepfor = input_to_keepfor(keepfor);
    }
}

const load_and_set_naming = async () => {
    let sarraya = ["prefix", "suffix", "format_year", "format_mon", "format_day"];

    let data = await browser.storage.local.get(sarraya);

    if (undefined === data || null === data) {
        return;
    }
    let { format_year, format_mon, format_day } = data;

    if (is_nonempty_string(data.prefix)) {
        config.prefix = data.prefix;
        config.prefixes.push(data.prefix);
    }
    if (is_nonempty_string(data.suffix)) {
        config.suffix = data.suffix;
    }
    if (is_nonempty_string(format_year)) {
        config.format_options.year = format_year;
    }
    if (is_nonempty_string(format_mon)) {
        config.format_options.month = format_mon;
    }
    if (is_nonempty_string(format_day)) {
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