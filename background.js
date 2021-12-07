const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

const DEFAULT_INTERVAL = MINUTE * 30;
const DEFAULT_KEEPFOR = HOUR * 48;

const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h"];
const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d", "6d", "7d"];
Object.freeze(VALID_INTERVALS);
Object.freeze(VALID_KEEPS);

let prefix = "mudbz_";
let suffix = "";
let format_options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
let locale = "default";

/**
 * debuging options
 */
let debuging = false;
let debug_entropy = 64;
let debug_random_radix = "16";

const input_to_interval = value => {
    if (!VALID_INTERVALS.includes(value)) {
        return DEFAULT_INTERVAL;
    }
    let replaced = value.replace("h", "");
    return HOUR * Number(replaced);;
}

const parse_interval_range = value => MINUTE * Number(value);

const input_to_keepfor = value => {
    if (!VALID_KEEPS.includes(value)) {
        //falback to safe value
        return DEFAULT_KEEPFOR;
    }
    if ("12h" === value) {
        return HOUR * 12;
    }
    let replaced = value.replace("d", "");
    return HOUR * 24 * Number(replaced);
}

const parse_keepfor_range = value => HOUR * Number(value);

let interval = HOUR;
let keepfor = DAY * 2;
//override for testing
interval = SECOND * 120;
keepfor = SECOND * 360;

let runner = async () => {
    //delete old items
    let folders = await browser.bookmarks.search({ query: prefix });
    let early_date = new Date(Date.now() - keepfor);
    for (const fold of folders) {
        if (fold.dateAdded < early_date) {
            console.log(`DELETE:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);

        }
    }

    //search tabs
    let tabs = await browser.tabs.query({});

    let formated = new Date().toLocaleString(locale, format_options).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
    let title = `${prefix}${formated}${suffix}`;

    if (debuging) {
        //add some randomness
        let _substr = `_${randa(debug_entropy, debug_random_radix)}`;
        title = title.concat(_substr);
    }
    let folder = await browser.bookmarks.create({ title });

    const folder_id = folder.id;

    //save tabs to folder
    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }

}

const load_and_set_interval = async process => {
    if (debuging) {
        return;
    }
    let data = await browser.storage.local.get(["interval", "custom_interval"]);
    if (undefined === data || null === data) {
        return;
    }
    let _interval = data.interval;
    let _custom = data.custom_interval;
    if ("c" === _interval) {
        _interval = parse_interval_range(_custom);
    } else {
        _interval = input_to_interval(_interval);
    }
    //if interval was changed
    if (_interval != interval) {
        window.clearInterval(process.runner_id);
        process.runner_id = window.setInterval(runner, _interval);
        interval = _interval;
    }
}

const load_and_set_keepfor = async () => {
    if (debuging) {
        return;
    }
    let data = await browser.storage.local.get(["keepfor", "custom_keepfor"]);
    if (undefined === data || null === data) {
        return;
    }

    let _keepfor = data.keepfor;
    let _custom = data.custom_keepfor;
    if ("c" === _keepfor) {
        keepfor = parse_keepfor_range(_custom);
    } else {
        keepfor = input_to_keepfor(_keepfor);
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
        prefix = data.prefix;
    }
    if (is_nonempty_string(data.suffix)) {
        suffix = data.suffix;
    }
    if (is_nonempty_string(format_year)) {
        format_options.year = format_year;
    }
    if (is_nonempty_string(format_mon)) {
        format_options.month = format_mon;
    }
    if (is_nonempty_string(format_day)) {
        format_options.day = format_day;
    }
}

let process = {};
process.runner_id = window.setInterval(runner, interval);

window.setTimeout(async () => {
    // load and set interval
    await load_and_set_interval(process);
    //load and set keepfor
    await load_and_set_keepfor();
    // load and set prefix/suffix
    await load_and_set_naming();
}, 2000);

browser.storage.onChanged.addListener(async () => {
    // load and set interval
    await load_and_set_interval(process);
    //load and set keepfor
    await load_and_set_keepfor();
    // load and set prefix/suffix
    await load_and_set_naming();
});

browser.browserAction.onClicked.addListener(async () => {
    await browser.runtime.openOptionsPage();
})