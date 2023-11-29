function togglePrices(e) {
    chrome.storage.local.set({ converterActive: e.target.checked });
}

const toggleStatus = chrome.storage.local.get(["converterActive"]);
toggleStatus.then((result) => {
    document.getElementById("price-toggle").checked = result.converterActive;
});

const taxData = chrome.storage.local.get(["taxValue"]);
taxData.then((result) => {
    document.getElementById("tax-input").value = result.taxValue ?? "";
});

const currencyData = chrome.storage.local.get(["currency"]);
let select = document.getElementById("convert-to");

currencyData.then((result) => {
    regions?.forEach((region) => {
    let regionLabel = new Option(region.name, "", true);
    regionLabel.disabled = true;
    select.add(regionLabel, undefined);

    Object.keys(result.currency.rates)
        .filter((e) => region.currencies[e])
        .forEach((key) => {
            let newOption = new Option(key, key);
            select.add(newOption, undefined);
        });
    });

    chrome.storage.local.get(["targetCurrency"], function (result) {
        select.value = result.targetCurrency;
    });
});
function changeCurrency(e) {
    chrome.storage.local.set({ targetCurrency: e.target.value });
}
function taxHandler(e) {
    chrome.storage.local.set({ taxValue: e.target.value });
}

document.getElementById("price-toggle").addEventListener("change", togglePrices);

document.getElementById("convert-to").addEventListener("change", changeCurrency);

document.getElementById("tax-input").addEventListener("change", taxHandler);
