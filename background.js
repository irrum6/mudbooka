const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h"];
const VALID_KEEPS = ["12h", "1d", "2d", "3d", "4d", "5d"];
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

const input_to_keepfor = value => {
    let returnval = HOUR * 48;
    if (!VALID_KEEPS.includes(value)) {
        //falback to safe value
        return returnval;
    }
    switch (value) {
        case "6h":
            returnval = HOUR * 6;
            break;
        case "12h":
            returnval = HOUR * 12;
            break;
        case "1d":
        case "2d":
        case "3d":
        case "4d":
        case "5d":
            returnval = HOUR * 24 * Number(value.replace("d", ""));
            break;
        default:
            returnval = HOUR * 48;
    }
    return returnval;
}

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

    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }

    //delete old items
    let folders = await browser.bookmarks.search({ query: prefix });
    let early_date = new Date(Date.now() - keepfor);
    for (const fold of folders) {
        if (fold.dateAdded < early_date) {
            console.log(`DELETE:${fold.title}`);
            await browser.bookmarks.removeTree(fold.id);

        }
    }

}

let runner_id = window.setInterval(runner, interval);

browser.storage.onChanged.addListener(async () => {
    //console.log("soc");
    window.clearInterval(runner_id);

    let got_interval = await browser.storage.local.get("interval");
    if (undefined !== got_interval) {
        interval = input_to_interval(got_interval.interval);
    }
    let got_keepfor = await browser.storage.local.get("keepfor");
    if (undefined !== got_keepfor) {
        keepfor = input_to_keepfor(got_keepfor.keepfor);
    }
    console.log(interval, keepfor);
    runner_id = window.setInterval(runner, interval);
});

browser.browserAction.onClicked.addListener(async () => {
    await browser.runtime.openOptionsPage();
})