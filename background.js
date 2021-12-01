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

    let formated = new Date().toLocaleString('default', format_options).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
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

const load_and_set_interval = async (runner_id) => {
    if (debuging) {
        return;
    }
    let _interval = 0;
    let got_interval = await browser.storage.local.get("interval");
    if (undefined !== got_interval) {
        let _value = got_interval.interval;
        if ("c" === _value) {
            let _range = await browser.storage.local.get("custom_interval");
            _interval = parse_interval_range(_range.custom_interval);
        } else {
            _interval = input_to_interval(_value);
        }
    }
    //if interval was changed
    if (_interval != interval) {
        window.clearInterval(runner_id);
        interval = _interval;
        runner_id = window.setInterval(runner, interval);
    }
}

const load_and_set_keepfor = async () => {
    if (debuging) {
        return;
    }
    let got_keepfor = await browser.storage.local.get("keepfor");
    if (undefined !== got_keepfor) {
        let _value = got_keepfor.keepfor;
        if ("c" === _value) {
            let _range = await browser.storage.local.get("custom_keepfor");
            keepfor = parse_keepfor_range(_range.custom_keepfor);
        } else {
            keepfor = input_to_keepfor(_value);
        }
    }
}

const load_and_set_naming = async () => {
    let pre = await browser.storage.local.get("prefix");
    if (undefined !== pre && typeof pre.prefix == "string" && pre.prefix != "") {
        prefix = pre.prefix;
    }
    let su = await browser.storage.local.get("suffix");
    if (undefined !== su && typeof su.suffix == "string" && su.suffix != "") {
        suffix = su.suffix;
    }
    let fyv = await browser.storage.local.get("format_year");
    if (undefined !== su && typeof fyv.format_year == "string" && fyv.format_year != "") {
        format_options.year = fyv.format_year;
    }
    let fmv = await browser.storage.local.get("format_mon");
    if (undefined !== fmv && typeof fmv.format_mon == "string" && fmv.format_mon != "") {
        format_options.month = fmv.format_mon;
    }
    let fdv = await browser.storage.local.get("format_day");
    if (undefined !== fdv && typeof fdv.format_day == "string" && fdv.format_day != "") {
        format_options.day = fdv.format_day;
    }
}

let runner_id = window.setInterval(runner, interval);

window.setTimeout(async () => {
    // load and set interval
    await load_and_set_interval(runner_id);
    //load and set keepfor
    await load_and_set_keepfor();
}, 2000);

browser.storage.onChanged.addListener(async () => {
    // load and set interval
    await load_and_set_interval(runner_id);
    //load and set keepfor
    await load_and_set_keepfor();
    // load and set prefix/suffix
    await load_and_set_naming();
});

browser.browserAction.onClicked.addListener(async () => {
    await browser.runtime.openOptionsPage();
})