const SECOND = 1000;
const HALF_SECOND = 500;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

class AutoBookmarkerConfig {
    constructor() {
        this.conf = Object.create(null);
        this.loadDefaults();
    }
    loadDefaults() {
        const defaultFormat = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        this.conf.formatOptions = Object.create(null);
        for (const k in defaultFormat) {
            this.conf.formatOptions[k] = defaultFormat[k];
        }

        this.conf.prefix = "";
        this.conf.suffix = "_tabs";
        this.conf.locale = "default";
        this.conf.debuging = false;
        this.conf.debugEntropy = 64;
        this.conf.debugRandomRadix = "16";
        this.conf.folderName = "mudbooker_tabs";
        this.conf.interval = HOUR * 1;
        this.conf.keepfor = DAY * 2;
        this.conf.keepItems = 1;
        this.conf.separateFolders = false;
    }

    get separateFolders() {
        return this.conf.separateFolders;
    }

    get prefix() {
        return this.conf.prefix;
    }
    set prefix(pfx) {
        if (!Utils.isString(pfx)) {
            return false;
        }
        this.conf.prefix = pfx;
        return true;
    }

    get suffix() {
        return this.conf.suffix;
    }
    /**
     * @param {String} sfx
     */
    set suffix(sfx) {
        if (!Utils.isString(sfx)) {
            return false;
        }
        this.conf.suffix = sfx;
        return true;
    }

    get format() {
        return this.conf.formatOptions;
    }

    set format(fmt) {
        //hour and minute stay as they are (2-digit)
        const VALID_KEYS = {
            year: ["2-digit", "numeric"],
            month: ["numeric", "long", "short"]
        };
        for (const k in fmt) {
            //ignore undescribed keys
            if (VALID_KEYS[k] === undefined) {
                continue;
            }
            let validValues = VALID_KEYS[k];
            let value = fmt[k];
            // ignore nondescribed values
            if (!Utils.contains(validValues, value)) {
                continue;
            }
            //assign correct value
            this.conf.formatOptions[k] = value;
        }
    }

    get folderName() {
        return this.conf.folderName;
    }

    set folderName(fold) {
        if (!Utils.isNoneEmptyString(fold)) {
            return false;
        }
        this.conf.folderName = fold;
        return true;
    }

    async loadNaming() {
        let sarraya = ["prefix", "suffix", "format_year", "format_mon", "folder_name", "separateFolders"];

        let data = await browser.storage.local.get(sarraya);

        if (undefined === data || null === data) {
            return;
        }
        let { prefix, suffix, format_year, format_mon, folder_name, separateFolders } = data;

        this.prefix = prefix;
        this.suffix = suffix;

        const fmt = { year: format_year, month: format_mon }

        this.format = fmt;
        this.folderName = folder_name;
        this.conf.separateFolders = (separateFolders === "yes");
    }

    get debug() {
        let debug = Object.create(null);
        debug.enabled = this.conf.debuging;
        debug.entropy = this.conf.debugEntropy;
        debug.radix = this.conf.debugRandomRadix;
        return debug;
    }

    set debug(dbg) {
        if (typeof dbg !== "boolean") {
            return false;
        }
        this.conf.debuging = dbg;
    }

    get interval() {
        return this.conf.interval;
    }
    set interval(num) {
        if (!Utils.isPositiveInteger(num)) {
            return false;
        }
        this.conf.interval = num;
    }
    /**
     * @returns {Promise<Integer>}
     */
    async loadInterval() {
        if (this.debuging) {
            return this.interval;
        }
        let data = await browser.storage.local.get(["interval", "custom_interval"]);
        if (undefined === data || null === data) {
            //if no valid data, do nothing and return existing value
            return this.interval;
        }

        let { interval, custom_interval } = data;
        if (undefined === interval || undefined === custom_interval) {
            return this.interval;
        }
        if ("c" === interval) {
            interval = Utils.parseIntervalRange(custom_interval);
        } else {
            interval = Utils.convertInterval(interval);
        }

        this.interval = interval;
        return interval;
    }

    get keepfor() {
        return this.conf.keepfor;
    }

    set keepfor(num) {
        if (!Utils.isPositiveInteger(num)) {
            return false;
        }
        this.conf.keepfor = num;
    }

    get items() {
        return this.conf.keepItems;
    }

    set items(num) {
        if (!Utils.isPositiveInteger(num)) {
            throw "NaNi"
        }
        this.conf.keepItems = num;
    }

    /**
     * @returns {Promise<Integer>}
     */
    async loadKeepfor() {
        if (this.debug.enabled) {
            //return existing value
            return this.keepfor;
        }
        let data = await browser.storage.local.get(["keepfor", "custom_keepfor", "keep_items"]);
        if (undefined === data || null === data) {
            //if no valid data, do nothing and return existing value
            return this.keepfor;
        }

        let { keepfor, custom_keepfor, keep_items } = data;
        if (undefined === keepfor || undefined === custom_keepfor) {
            return this.keepfor;
        }
        //resete before loading
        this.items = 1;
        if ("mx" === keepfor) {
            this.items = Number(keep_items);
        } else if ("c" === keepfor) {
            keepfor = Utils.parseKeepforRange(custom_keepfor);
        } else {
            keepfor = Utils.convertKeepfor(keepfor);
        }



        this.keepfor = keepfor;
        return keepfor;
    }

}
class AutoBookmarker {
    constructor() {
        this.config = new AutoBookmarkerConfig();
        // process data
        const pdata = Object.create(null);
        pdata.last_time = 0;
        pdata.next_time = 0;
        this.pdata = pdata;
    }
    /**Creates parent folder
     * @returns {Number}
    */
    async touchParentID() {
        let folder_name = this.config.folderName;
        let bookers = await browser.bookmarks.search({ query: folder_name });

        if (bookers.length < 1) {
            //if doesn't exist, then create it
            let booker = await browser.bookmarks.create({
                title: this.config.folderName,
                parentId: "toolbar_____"
            });
            return booker.id;
        }

        return bookers[0].id;
    }

    async removeOldFolders() {
        //debugger;
        let keep = this.config.keepfor;
        //for max number use reverse sort
        //168 * 4 = 672
        const sorter = (a, b) => {
            if (a.dateAdded < b.dateAdded) {
                return -1;
            }
            if (a.dateAdded > b.dateAdded) {
                return 1;
            }
            return 0;
        }

        const reverse_sorter = (a, b) => {
            if (a.dateAdded < b.dateAdded) {
                return 1;
            }
            if (a.dateAdded > b.dateAdded) {
                return -1;
            }
            return 0;
        }

        let parent_id = await this.touchParentID();

        let children = await browser.bookmarks.getChildren(parent_id);

        let earlyDate = new Date(Date.now() - keep);

        //save only few items
        if (this.config.items > 1) {
            children.sort(reverse_sorter);
            while (children.length > this.config.items) {
                let child = children.pop();
                let dat = new Date(child.dateAdded);
                console.log(`Now deleting bookmark added on ${dat.toLocaleString()}`);
                await browser.bookmarks.removeTree(child.id);
            }
            return;
        }

        //do split
        let selectedForDeletion = children.filter(e => e.dateAdded <= earlyDate);
        selectedForDeletion.sort(sorter);

        if (selectedForDeletion.length > 0) {
            selectedForDeletion.pop();
        }

        try {
            for (const fold of selectedForDeletion) {
                let dat = new Date(fold.dateAdded);
                console.log(`Now deleting bookmark added on ${dat.toLocaleString()}`);
                await browser.bookmarks.removeTree(fold.id);
            }
        } catch (e) {
            console.log(e);
        } finally {

        }

    }

    /**
    * @returns {Promise<Boolean>}
    */
    async loadAndSetInterval() {
        let oldInterval = this.config.interval;
        let interval = await this.config.loadInterval();
        //if interval was changed
        if (oldInterval !== interval) {
            //change next time run
            if (this.pdata.last_time == 0) {
                this.pdata.last_time = Date.now();
            }
            this.pdata.next_time = this.pdata.last_time + this.config.interval;
            await browser.storage.local.set({ last: this.pdata.last_time, next: this.pdata.next_time });
        }
        return true;
    }

    //the main function
    /**
     * @param {boolean} first
     */
    async runner(first) {
        // console.log(281);

        if (Date.now() < this.pdata.next_time && (false === first || undefined === first)) {
            // console.log(new Date(this.pdata.next_time));
            return;
        }
        //search tabs
        let tabs = await browser.tabs.query({});

        //load variables
        let { locale, format, prefix, suffix, debug } = this.config;

        let formated = new Date().toLocaleString(locale, format).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
        //fix undefined prefix/suffix bug , caused of which is not determined yet (on loading/set naming bug might be)
        let title = `${formated}`
        if (Utils.isNoneEmptyString(prefix)) {
            title = `${prefix}${title}`;
        }
        if (Utils.isNoneEmptyString(suffix)) {
            title = `${title}${suffix}`;
        }

        if (debug.enabled) {
            //add some randomness
            let _substr = `_${Utils.GetRandomString(debug.entropy, debug.radix)}`;
            title = title.concat(_substr);
        }

        let parent_id = await this.touchParentID();

        let idMaps = new Map();
        if (this.config.separateFolders) {
            let windows = await browser.windows.getAll();
            for (let wIndex = 0, wLen = windows.length; wIndex < wLen; wIndex++) {
                let win = windows[wIndex];
                let titlet = `${title}_w${wIndex + 1}`;
                let newFolder = await browser.bookmarks.create({ title: titlet, parentId: parent_id });
                idMaps.set(win.id, newFolder.id);
            }
        } else {
            let newFolder = await browser.bookmarks.create({ title, parentId: parent_id });
            idMaps.set("default", newFolder.id);
        }

        let defaultFolderId = idMaps.get("default");

        for (const t of tabs) {
            const { title, url, windowId } = t;
            if (this.config.separateFolders) {
                let parentId = idMaps.get(windowId);
                await browser.bookmarks.create({ parentId: parentId, title, url });
                continue;
            }
            await browser.bookmarks.create({ parentId: defaultFolderId, title, url });
        }

        this.pdata.last_time = Date.now();
        this.pdata.next_time = this.pdata.last_time + this.config.interval;

        let nudate = new Date(this.pdata.last_time);
        let hours = nudate.getHours().toString().padStart(2, "0");
        let minutes = nudate.getMinutes().toString().padStart(2, "0");
        let message = `${hours}:${minutes} - tabs were bookmarked`;

        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.runtime.getURL("icons/logo.png"),
            "title": "MudBooker",
            "message": message
        });

        await browser.storage.local.set({ last: this.pdata.last_time, next: this.pdata.next_time });

        await this.removeOldFolders();
    }
    async loadDataFromLocalStorage() {
        await this.loadAndSetInterval();
        await this.config.loadKeepfor();
        await this.config.loadNaming();
    }
    /**
     * Start
     */
    async start() {
        //if process is running then not start again
        if (this.pdata.runner_id !== undefined) {
            return false;
        }
        await this.runner(true);
        this.pdata.runner_id = window.setInterval(this.runner.bind(this), HALF_SECOND);
    }
    /**
     * @returns 
     */
    async forced_run() {
        await this.runner(true);
    }
}

const mdBooker = new AutoBookmarker();
mdBooker.loadDataFromLocalStorage();
mdBooker.start();

browser.storage.onChanged.addListener(async () => {
    // console.log(372);
    await mdBooker.loadDataFromLocalStorage();
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // console.log(request.command);
    if (request.command == "runmenow") {
        await mdBooker.forced_run();
    }
});