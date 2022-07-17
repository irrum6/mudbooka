const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = SECOND * 3600;
const DAY = HOUR * 24;

class AutoBookmarker {
    constructor() {
        this.setupConfig();
        // process data
        const pdata = Object.create(null);
        pdata.last_time = 0;
        pdata.next_time = 0;
        this.pdata = pdata;
    }
    setupConfig() {
        const formatOptions = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };

        this.config = {
            prefix: "",
            suffix: "_tabs",
            formatOptions,
            locale: "default",
            debuging: false,
            debugEntropy: 64,
            debugRandomRadix: "16",
            folder_name: "mudbooker_tabs",
            interval: HOUR * 1,
            keepfor: DAY * 2
        }
    }
    async touchParentID() {
        let folder_name = this.config.folder_name;
        let bookers = await browser.bookmarks.search({ query: folder_name });

        if (bookers.length < 1) {
            //if doesn't exist, then create it
            let booker = await browser.bookmarks.create({
                title: config.folder_name,
                parentId: "toolbar_____"
            });
            return booker.id;
        }

        return bookers[0].id;
    }

    async removeOldFolders() {
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

        let parent_id = await this.touchParentID();

        let children = await browser.bookmarks.getChildren(parent_id);

        let earlyDate = new Date(Date.now() - keep);

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
        if (this.config.debuging) {
            return false;
        }
        let data = await browser.storage.local.get(["interval", "custom_interval"]);
        if (undefined === data || null === data) {
            return false;
        }

        let { interval, custom_interval } = data;
        if ("c" === interval) {
            let intervalRangeParsed = MINUTE * custom_interval
            interval = intervalRangeParsed;
        } else {
            interval = Utils.convertInterval(interval);
        }
        //if interval was changed
        if (interval != this.config.interval) {
            this.restart();
        }
        return true;
    }

    /** 
     * @returns {Promise<Boolean>}
     */
    async loadAndSetKeepfor() {
        if (this.config.debuging) {
            return false;
        }
        let data = await browser.storage.local.get(["keepfor", "custom_keepfor"]);
        if (undefined === data || null === data) {
            return false;
        }
        const parse_keepfor_range = value => HOUR * Number(value);

        let { keepfor, custom_keepfor } = data;
        if ("c" === keepfor) {
            this.config.keepfor = parse_keepfor_range(custom_keepfor);
        } else {
            this.config.keepfor = Utils.convertKeepfor(keepfor);
        }
        return true;
    }

    async loadAndSetNaming() {
        let sarraya = ["prefix", "suffix", "format_year", "format_mon", "format_day", "folder_name"];

        let data = await browser.storage.local.get(sarraya);

        if (undefined === data || null === data) {
            return;
        }
        let { prefix, suffix, format_year, format_mon, format_day, folder_name } = data;

        if (Utils.isString(prefix)) {
            this.config.prefix = prefix;
        }
        if (Utils.isString(suffix)) {
            this.config.suffix = suffix;
        }

        if (Utils.isNoneEmptyString(format_year)) {
            this.config.formatOptions.year = format_year;
        }
        if (Utils.isNoneEmptyString(format_mon)) {
            this.config.formatOptions.month = format_mon;
        }
        if (Utils.isNoneEmptyString(format_day)) {
            this.config.formatOptions.day = format_day;
        }
        if (Utils.isNoneEmptyString(folder_name)) {
            this.config.folder_name = folder_name;
        }
    }
    //the main function
    async runner() {
        //debugger;
        //search tabs
        let tabs = await browser.tabs.query({});

        //load variables
        let { locale, formatOptions, prefix, suffix, debuging, debugEntropy, debugRandomRadix } = this.config;

        let formated = new Date().toLocaleString(locale, formatOptions).replace(/[\s.,]+/gi, "_").replace(/:/, "h");
        //fix undefined prefix/suffix bug , caused of which is not determined yet (on loading/set naming bug might be)
        let title = `${formated}`
        if (Utils.isNoneEmptyString(prefix)) {
            title = `${prefix}${title}`;
        }
        if (Utils.isNoneEmptyString(suffix)) {
            title = `${title}${suffix}`;
        }

        if (debuging) {
            //add some randomness
            let _substr = `_${Utils.GetRandomString(debugEntropy, debugRandomRadix)}`;
            title = title.concat(_substr);
        }

        let parent_id = await this.touchParentID();
        //console.log(parent_id);
        let newFolder = await browser.bookmarks.create({ title, parentId: parent_id });

        const folder_id = newFolder.id;

        //save tabs to folder
        for (const t of tabs) {
            const { title, url } = t;
            await browser.bookmarks.create({ parentId: folder_id, title, url });
        }

        this.pdata.last_time = Date.now();
        this.pdata.next_time = this.pdata.last_time + this.config.interval;

        let nudate = new Date(this.pdata.last_time);
        let message = `${nudate.getHours()}:${nudate.getMinutes()} - tabs were bookmarked`;

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
        await this.loadAndSetKeepfor();
        await this.loadAndSetNaming();
    }
    /**
     * Start
     */
    async start() {
        //if process is running then not start again
        //restart is seperate function
        if (this.pdata.runner_id !== undefined) {
            return false;
        }
        this.runner();
        let interval = this.config.interval;
        const runner_bounded = this.runner.bind(this);
        this.pdata.runner_id = window.setInterval(runner_bounded, interval);
    }
    /**
     * Restart
     * @returns 
     */
    async restart() {
        if (this.pdata.runner_id === undefined) {
            return false;
        }
        this.runner();
        window.clearInterval(this.pdata.runner_id);
        let interval = this.config.interval;
        const runner_bounded = this.runner.bind(this);
        this.pdata.runner_id = window.setInterval(runner_bounded, interval);
    }
}

const mdBooker = new AutoBookmarker();
mdBooker.loadDataFromLocalStorage();
mdBooker.start();

browser.storage.onChanged.addListener(async () => {
    await mdBooker.loadDataFromLocalStorage();
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.command == "tuesday") {
        mdBooker.restart();
    }
});