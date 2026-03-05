document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", () => {
    document.querySelectorAll(".sd-panel.open").forEach((p) => p.classList.remove("open"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".sd-panel.open").forEach((p) => p.classList.remove("open"));
    }
  });

  const targetSd = initSearchableDropdown(
    document.getElementById("choose-target-sd"),
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

    const targetEntries = [];

    regions?.forEach((region) => {
      const regionCodes = Object.keys(region.currencies).filter(
        (code) => rates[code] || customCodes.has(code)
      );
      if (!regionCodes.length) return;

      targetEntries.push({ group: region.name });
      regionCodes.forEach((code) => {
        const custom = customCurrencies[code];
        const label = custom ? `${custom.symbol} ${code}` : code;
        const hint = custom ? custom.name : (hintMap[code] || "");
        targetEntries.push({ value: code, label, hint });
      });
    });

    targetSd.populate(targetEntries);

    if (preferenceResult.targetCurrency) {
      targetSd.setValue(preferenceResult.targetCurrency);
    }
  }

  populateCurrencyOptions().catch((error) => {
    console.error("Error populating currency options:", error);
  });

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
});
