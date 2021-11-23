console.log(`SideBar was loaded on ${new Date().toString()}`);
console.log("I am Autoboo!");

const q = s => document.body.querySelector(s);
const on = "addEventListener";

const get_input_value = input_name => q(`input[name=${input_name}]`).value;
const get_input_date = input_name => new Date(get_input_value(input_name));

const MINUTE = 60 * 1000;
const HOUR = 3600 * 1000;
const DAY = 24 * 3600 * 1000;

const VALID_INTERVALS = ["1h", "2h", "3h", "4h", "5h", "6h"];
const VALID_KEEPS = ["2d", "3d", "4d", "5d"];
Object.freeze(VALID_INTERVALS);
Object.freeze(VALID_KEEPS);

let interval = MINUTE * 30;
// interval = HOUR;
let keepfor = MINUTE * 180;
// keepfor = DAY * 2;

//keep list of created folders
const listkeeper = [];

let runner = async () => {
    let tabs = await browser.tabs.query({});
    let prefix = "mudbooka_bookmarks"

    let format_options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    let formated = new Date().toLocaleString('default', format_options).replace(/[\s:,]+/gi, "_");
    let title = `${prefix}${formated}`;
    let folder = await browser.bookmarks.create({ title });

    const folder_id = folder.id;
    listkeeper.push(folder_id);

    for (const t of tabs) {
        const { title, url } = t;
        await browser.bookmarks.create({ parentId: folder_id, title, url });
    }

    //log currently added items
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

const input_value_to_interval = inputval => {
    let returnval = HOUR * 0.5;
    switch (inputval) {
        case "1h":
        case "2h":
        case "3h":
        case "4h":
        case "5h":
        case "6h":
            returnval = HOUR * Number(inputval);
            break;
        default:
            returnval = HOUR * 0.5;
    }
    return returnval;
}

const input_value_to_keep = inputval => {
    let returnval = HOUR * 48;
    switch (inputval) {
        case "2d":
        case "3d":
        case "4d":
        case "5d":
            returnval = HOUR * 24 * Number(inputval);
            break;
        default:
            returnval = HOUR * 48;
    }
    return returnval;
}

/**
 * Retrieves input values and sets interval and keepfor values
 * @param {Event} e 
 */
const onSetParameters = e => {
    let inter = q("input[name=period]:checked");
    if (inter !== undefined && inter !== null) {
        interval = input_value_to_interval(inter.value);
    }
    let keeper = q("input[name=keep]:checked");
    if (keeper !== undefined && keeper !== null) {
        keepfor = input_value_to_keep(keeper.value);
    }
    window.clearInterval(runner_id);
    runner_id = window.setInterval(runner, interval);
}

// runner();
q("#action")[on]("click", onSetParameters);