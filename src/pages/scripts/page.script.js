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

function initSearchableDropdown(sd, onChange) {
  const trigger = sd.querySelector(".sd-trigger");
  const panel = sd.querySelector(".sd-panel");
  const search = sd.querySelector(".sd-search");
  const optionsContainer = sd.querySelector(".sd-options");
  let selectedValue = null;
  let allEntries = [];

  function open() {
    document.querySelectorAll(".sd-panel.open").forEach((p) => {
      if (p !== panel) p.classList.remove("open");
    });
    panel.classList.add("open");
    search.value = "";
    filterOptions("");
    search.focus();
  }

  function close() {
    panel.classList.remove("open");
  }

  function filterOptions(query) {
    const q = query.toLowerCase();
    let lastGroupEl = null;
    let groupHasVisible = false;

    optionsContainer.querySelectorAll(".sd-group, .sd-option, .sd-empty").forEach((el) => {
      if (el.classList.contains("sd-empty")) {
        el.remove();
        return;
      }
      if (el.classList.contains("sd-group")) {
        if (lastGroupEl && !groupHasVisible) lastGroupEl.style.display = "none";
        lastGroupEl = el;
        groupHasVisible = false;
        el.style.display = "";
        return;
      }
      const text = (el.dataset.value + " " + el.textContent).toLowerCase();
      const visible = !q || text.includes(q);
      el.style.display = visible ? "" : "none";
      if (visible) groupHasVisible = true;
    });

    if (lastGroupEl && !groupHasVisible) lastGroupEl.style.display = "none";

    const anyVisible = optionsContainer.querySelector(".sd-option:not([style*='display: none'])");
    if (!anyVisible) {
      const empty = document.createElement("div");
      empty.className = "sd-empty";
      empty.textContent = "No results";
      optionsContainer.appendChild(empty);
    }
  }

  function selectValue(value, label) {
    selectedValue = value;
    trigger.textContent = label || value;
    optionsContainer.querySelectorAll(".sd-option").forEach((o) => {
      o.classList.toggle("selected", o.dataset.value === value);
    });
    close();
    if (onChange) onChange(value);
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) {
      close();
    } else {
      open();
    }
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  search.addEventListener("input", () => filterOptions(search.value));

  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return {
    populate(entries) {
      allEntries = entries;
      optionsContainer.innerHTML = "";
      entries.forEach((entry) => {
        if (entry.group) {
          const g = document.createElement("div");
          g.className = "sd-group";
          g.textContent = entry.group;
          optionsContainer.appendChild(g);
        } else {
          const o = document.createElement("div");
          o.className = "sd-option";
          if (entry.value === selectedValue) o.classList.add("selected");
          o.dataset.value = entry.value;
          o.textContent = entry.label;
          o.addEventListener("click", () => selectValue(entry.value, entry.label));
          optionsContainer.appendChild(o);
        }
      });
    },
    setValue(value) {
      selectedValue = value;
      const match = allEntries.find((e) => e.value === value);
      trigger.textContent = match?.label || value;
      optionsContainer.querySelectorAll(".sd-option").forEach((o) => {
        o.classList.toggle("selected", o.dataset.value === value);
      });
    },
    getValue() {
      return selectedValue;
    },
  };
}

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

  const baseEntries = [];
  const targetEntries = [];

  regions?.forEach((region) => {
    const allCodes = Object.keys(region.currencies);
    const baseCodes = allCodes.filter((code) => rates[code]);
    const targetCodes = allCodes.filter(
      (code) => rates[code] || customCodes.has(code)
    );

    if (baseCodes.length) {
      baseEntries.push({ group: region.name });
      baseCodes.forEach((code) => {
        baseEntries.push({ value: code, label: code });
      });
    }

    if (targetCodes.length) {
      targetEntries.push({ group: region.name });
      targetCodes.forEach((code) => {
        const custom = customCurrencies[code];
        const label = custom ? `${custom.symbol} ${code}` : code;
        targetEntries.push({ value: code, label });
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
