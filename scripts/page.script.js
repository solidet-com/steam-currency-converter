function togglePrices(e) {
  chrome.storage.local.set({ converterActive: e.target.checked });
}

const toggleStatus = chrome.storage.local.get(["converterActive"]);
toggleStatus.then((result) => {
  document.getElementById("price-toggle").checked = result.converterActive;
});

const taxData = chrome.storage.local.get(["taxValue"]);
taxData.then((result) => {
  document.getElementById("tax-input").value = result.taxValue;
});

const currency = chrome.storage.local.get(["currency"]);
let select = document.getElementById("convert-to");

currency.then((result) => {
  Object.keys(result.currency.rates)
    .filter((e) => e != "ARS" && e != "TRY")
    .forEach((key) => {
      let newOption = new Option(key, key);
      select.add(newOption, undefined);
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

document
  .getElementById("price-toggle")
  .addEventListener("change", togglePrices);

document
  .getElementById("convert-to")
  .addEventListener("change", changeCurrency);

document.getElementById("tax-input").addEventListener("change", taxHandler);
