function togglePrices() {
    chrome.storage.local.get(["converterActive"], function (result) {
        chrome.storage.local.set({ converterActive: !result.converterActive });
    });
}

document.getElementById("price-toggle").addEventListener("change", togglePrices);
