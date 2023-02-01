const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

query("#quickset")[on]("click", async () => {
    await browser.runtime.openOptionsPage();
});
query("#booknow")[on]("click", async () => {
    await browser.runtime.sendMessage(
        { command: "runmenow" }
    );
});

query("#last_title").textContent = browser.i18n.getMessage("lastrun");
query("#next_title").textContent = browser.i18n.getMessage("nextrun");

query("#open_tabs_title").textContent = browser.i18n.getMessage("open_tabs");
query("#open_windows_title").textContent = browser.i18n.getMessage("open_windows");

query("#win_normal").textContent = browser.i18n.getMessage("win_normal");
query("#win_private").textContent = browser.i18n.getMessage("win_private");


browser.storage.local.get(["last", "next"]).then(async (data) => {
    let last_date = new Date(Number(data.last))
    let next_date = new Date(Number(data.next));
    query("#last").textContent = last_date.toLocaleString();
    query("#next").textContent = next_date.toLocaleString();

    let tabs = await browser.tabs.query({});
    let windows = await browser.windows.getAll();
    let nonprivates = 0;
    let privates = 0;
    for (const w of windows) {
        if (w.incognito) {
            privates += 1;
            continue;
        }
        nonprivates += 1;
    }
    query("#open_tabs").textContent = tabs.length;
    query("#open_windows").textContent = windows.length;
    query("#norm").textContent = nonprivates;
    query("#private").textContent = privates;
});
