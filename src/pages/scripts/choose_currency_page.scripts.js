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

  chrome.storage.local
    .get(["targetCurrency", "baseStoreCurrency"])
    .then((result) => {
      select.value = result.targetCurrency;
    })
    .catch((error) => {
      console.error("Error retrieving data from chrome storage:", error);
    });
});

function changeBaseCurrency(e) {
  chrome.storage.local.set({ baseStoreCurrency: e.target.value });
}
function changeCurrency(e) {
  chrome.storage.local.set({ targetCurrency: e.target.value });
}

document
  .getElementById("convert-to")
  .addEventListener("change", changeCurrency);

document.getElementById("save-currency").addEventListener("click", () => {
  window.close();
});
