document.addEventListener("DOMContentLoaded", () => {
  function togglePrices(e) {
    chrome.storage.local.set({ converterActive: e.target.checked });
  }

  chrome.storage.local.get(["converterActive"]).then((result) => {
    document.getElementById("price-toggle").checked = result.converterActive;
  });

  chrome.storage.local.get(["taxValue"]).then((result) => {
    document.getElementById("tax-input").value = result.taxValue ?? "";
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".sd-panel.open").forEach((p) => p.classList.remove("open"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".sd-panel.open").forEach((p) => p.classList.remove("open"));
    }
  });

  const baseSd = initSearchableDropdown(
    document.getElementById("convert-from-sd"),
    (value) => chrome.storage.local.set({ baseStoreCurrency: value })
  );

  const targetSd = initSearchableDropdown(
    document.getElementById("convert-to-sd"),
    (value) => chrome.storage.local.set({ targetCurrency: value })
  );

  async function populateCurrencyOptions() {
    const [currencyResult, preferenceResult] = await Promise.all([
      chrome.storage.local.get(["currency"]),
      chrome.storage.local.get(["targetCurrency", "baseStoreCurrency"]),
    ]);

    const rates = currencyResult.currency?.rates || {};
    const customCurrencies = await loadCustomCurrencies();
    const customCodes = new Set(Object.keys(customCurrencies));

    const hintMap = {};
    if (typeof CURRENCY_INFORMATIONS !== "undefined") {
      CURRENCY_INFORMATIONS.forEach((c) => { if (c.abbr && c.hint) hintMap[c.abbr] = c.hint; });
    }

    const baseEntries = [];
    const targetEntries = [];

    regions?.forEach((region) => {
      const allCodes = Object.keys(region.currencies);
      const baseCodes = allCodes.filter((code) => rates[code] && !customCodes.has(code));
      const targetCodes = allCodes.filter(
        (code) => rates[code] || customCodes.has(code)
      );

      if (baseCodes.length) {
        baseEntries.push({ group: region.name });
        baseCodes.forEach((code) => {
          const hint = hintMap[code] || "";
          baseEntries.push({ value: code, label: code, hint });
        });
      }

      if (targetCodes.length) {
        targetEntries.push({ group: region.name });
        targetCodes.forEach((code) => {
          const custom = customCurrencies[code];
          const label = custom ? `${custom.symbol} ${code}` : code;
          const hint = custom ? custom.name : (hintMap[code] || "");
          targetEntries.push({ value: code, label, hint });
        });
      }
    });

    baseSd.populate(baseEntries);
    targetSd.populate(targetEntries);

    if (preferenceResult.baseStoreCurrency) {
      baseSd.setValue(preferenceResult.baseStoreCurrency);
    }
    if (preferenceResult.targetCurrency) {
      targetSd.setValue(preferenceResult.targetCurrency);
    }
  }

  populateCurrencyOptions().catch((error) => {
    console.error("Error populating currency options:", error);
  });

  function taxHandler(e) {
    chrome.storage.local.set({ taxValue: e.target.value });
  }

  document
    .getElementById("price-toggle")
    .addEventListener("change", togglePrices);

  document.getElementById("tax-input").addEventListener("change", taxHandler);

  document.querySelector(".github-button").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/solidet-com/steam-currency-converter", active: false });
  });

  document.getElementById("open-custom-currencies").addEventListener("click", () => {
    document.body.classList.add("page-exit");
    setTimeout(() => { window.location.href = "./custom-currencies.html"; }, 150);
  });

  document.getElementById("solidet-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://linktr.ee/solidet", active: false });
  });
});
