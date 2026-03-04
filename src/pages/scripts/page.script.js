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

let baseSelect = document.getElementById("convert-from");
let select = document.getElementById("convert-to");

async function populateCurrencyOptions() {
  const [currencyResult, preferenceResult] = await Promise.all([
    chrome.storage.local.get(["currency"]),
    chrome.storage.local.get(["targetCurrency", "baseStoreCurrency"]),
  ]);

  const rates = currencyResult.currency?.rates || {};
  const customCurrencies = await loadCustomCurrencies();
  const customCodes = new Set(Object.keys(customCurrencies));

  regions?.forEach((region) => {
    const allCodes = Object.keys(region.currencies);
    const baseCodes = allCodes.filter((code) => rates[code]);
    const targetCodes = allCodes.filter(
      (code) => rates[code] || customCodes.has(code)
    );

    if (baseCodes.length) {
      const baseLabel = new Option(region.name, "", true);
      baseLabel.disabled = true;
      baseSelect.add(baseLabel, undefined);
      baseCodes.forEach((code) => {
        baseSelect.add(new Option(code, code), undefined);
      });
    }

    if (targetCodes.length) {
      const targetLabel = new Option(region.name, "", true);
      targetLabel.disabled = true;
      select.add(targetLabel, undefined);
      targetCodes.forEach((code) => {
        const custom = customCurrencies[code];
        const label = custom ? `${custom.symbol} ${code}` : code;
        select.add(new Option(label, code), undefined);
      });
    }
  });

  if (preferenceResult.targetCurrency) {
    select.value = preferenceResult.targetCurrency;
  }
  if (preferenceResult.baseStoreCurrency) {
    baseSelect.value = preferenceResult.baseStoreCurrency;
  }
}

populateCurrencyOptions().catch((error) => {
  console.error("Error populating currency options:", error);
});

function changeBaseCurrency(e) {
  chrome.storage.local.set({ baseStoreCurrency: e.target.value });
}
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
  .getElementById("convert-from")
  .addEventListener("change", changeBaseCurrency);

document
  .getElementById("convert-to")
  .addEventListener("change", changeCurrency);

document.getElementById("tax-input").addEventListener("change", taxHandler);

document.querySelector(".github-button").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://github.com/solidet-com/steam-currency-converter", active: false });
});

document.getElementById("open-custom-currencies").addEventListener("click", () => {
  window.location.href = "./custom-currencies.html";
});

document.getElementById("solidet-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://linktr.ee/solidet", active: false });
});
