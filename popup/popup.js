const on = "addEventListener";
const query = s => document.body.querySelector(s);
const query_all = s => document.body.querySelectorAll(s);

query("#quickset")[on]("click", async () => {
    await browser.runtime.openOptionsPage();
});
query("#booknow")[on]("click", async () => {
    await browser.runtime.sendMessage(
        { command: "tuesday" }
    );
});

browser.storage.local.get(["last", "next"]).then((data) => {
    let last_date = new Date(Number(data.last))
    let next_date = new Date(Number(data.next));
    query("#last").textContent = last_date.toLocaleString();
    query("#next").textContent = next_date.toLocaleString();
});
