const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h"];
const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d", "6d", "7d"];
Object.freeze(VALID_INTERVALS);
Object.freeze(VALID_KEEPS);

const input_to_interval = value => {
    let returnval = HOUR * 0.5;
    if (!VALID_INTERVALS.includes(value)) {
        //falback to safe value
        return returnval;
    }

    let replaced = value.replace("h", "");
    let parsed = Number(replaced);
    return HOUR * parsed;
}

const parse_interval_range = value => MINUTE * Number(value);

const input_to_keepfor = value => {
    let returnval = HOUR * 48;
    if (!VALID_KEEPS.includes(value)) {
        //falback to safe value
        return returnval;
    }
    switch (value) {
        case "12h":
            returnval = HOUR * 12;
            break;
        case "1d":
        case "2d":
        case "3d":
        case "4d":
        case "5d":
        case "6d":
        case "7d":
            let replaced = value.replace("d", "");
            returnval = HOUR * 24 * Number(replaced);
            break;
        default:
            returnval = HOUR * 48;
    }
    return returnval;
}

const parse_keepfor_range = value => HOUR * Number(value);

const randstr = () => Array.prototype.map.call(window.crypto.getRandomValues(new Uint32Array(2)), e => e.toString("36")).join("");

let interval = HOUR;
let keepfor = DAY * 2;
//override for testing
interval = SECOND * 120;
keepfor = SECOND * 360;

let runner = async () => {
    let tabs = await browser.tabs.query({});
    let prefix = "m_bookmkarks_"

    let format_options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    let formated = new Date().toLocaleString('default', format_options).replace(/[\s:,]+/gi, "_");
    let title = `${prefix}${formated}_${randstr()}`;//some randomness
    let folder = await browser.bookmarks.create({ title });

    const folder_id = folder.id;

    //delete old items
    let folders = await browser.bookmarks.search({ query: prefix });
    let early_date = new Date(Date.now() - keepfor);
    for (const fold of folders) {
        if (fold.dateAdded < early_date) {
            console.log(`DELETE:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);

        }
    }

    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }

}

const load_and_set_interval = async () => {
    let got_interval = await browser.storage.local.get("interval");
    if (undefined !== got_interval) {
        let _value = got_interval.interval;
        if ("c" === _value) {
            let _range = await browser.storage.local.get("custom_interval");
            interval = parse_interval_range(_range.custom_interval);
        } else {
            interval = input_to_interval(_value);
        }
    }
}

const load_and_set_keepfor = async () => {
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

let runner_id = 0;

window.setTimeout(async () => {
    // load and set interval
    await load_and_set_interval();
    //load and set keepfor
    await load_and_set_keepfor();
    runner_id = window.setInterval(runner, interval);
}, 2000);

browser.storage.onChanged.addListener(async () => {
    window.clearInterval(runner_id);
    // load and set interval
    await load_and_set_interval();
    //load and set keepfor
    await load_and_set_keepfor();
    runner_id = window.setInterval(runner, interval);
});

browser.browserAction.onClicked.addListener(async () => {
    await browser.runtime.openOptionsPage();
})