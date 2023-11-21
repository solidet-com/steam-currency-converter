function togglePrices() {
    chrome.storage.local.get(["converterActive"], function (result) {
        chrome.storage.local.set({ converterActive: !result.converterActive });
    });
}

const toggleStatus = chrome.storage.local.get(["converterActive"]);
toggleStatus.then((result) => {
    document.getElementById("price-toggle").checked = result.converterActive;
});

document.getElementById("price-toggle").addEventListener("change", togglePrices);
