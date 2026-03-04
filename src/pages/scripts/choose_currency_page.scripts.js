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
    const regionCodes = Object.keys(region.currencies).filter(
      (code) => rates[code] || customCodes.has(code)
    );
    if (!regionCodes.length) {
      return;
    }

    const regionLabel = new Option(region.name, "", true);
    regionLabel.disabled = true;
    select.add(regionLabel, undefined);

    regionCodes.forEach((code) => {
      const custom = customCurrencies[code];
      const label = custom ? `${custom.symbol} ${code}` : code;
      select.add(new Option(label, code), undefined);
    });
  });

  if (preferenceResult.targetCurrency) {
    select.value = preferenceResult.targetCurrency;
  }
}

populateCurrencyOptions().catch((error) => {
  console.error("Error populating currency options:", error);
});

function changeCurrency(e) {
  chrome.storage.local.set({ targetCurrency: e.target.value });
}

document
  .getElementById("convert-to")
  .addEventListener("change", changeCurrency);

document.getElementById("save-currency").addEventListener("click", () => {
  window.close();
});

document.getElementById("open-custom-currencies").addEventListener("click", () => {
  document.body.classList.add("page-exit");
  setTimeout(() => { window.location.href = "./custom-currencies.html"; }, 150);
});

document.getElementById("solidet-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://linktr.ee/solidet", active: false });
});
