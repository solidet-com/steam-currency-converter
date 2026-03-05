document.addEventListener("DOMContentLoaded", async () => {
  const presetsContainer = document.getElementById("presets");
  const itemsContainer = document.getElementById("items");
  const msg = document.getElementById("msg");
  const baseSdEl = document.getElementById("cc-base-sd");
  const baseTrigger = document.getElementById("cc-base-trigger");
  const basePanel = document.getElementById("cc-base-panel");
  const baseSearchInput = document.getElementById("cc-base-search");
  const baseOptionsEl = document.getElementById("cc-base-options");
  const codeInput = document.getElementById("cc-code");
  const nameInput = document.getElementById("cc-name");
  const symbolInput = document.getElementById("cc-symbol");
  const rateInput = document.getElementById("cc-rate");
  const saveBtn = document.getElementById("save-btn");
  const clearBtn = document.getElementById("clear-btn");

  let baseSelectedValue = "USD";

  function openBaseDropdown() {
    baseSdEl.classList.add("open");
    baseSearchInput.value = "";
    filterBaseOptions("");
    baseSearchInput.focus();
  }

  function closeBaseDropdown() {
    baseSdEl.classList.remove("open");
  }

  function filterBaseOptions(query) {
    const q = query.toLowerCase();
    let anyVisible = false;
    baseOptionsEl.querySelectorAll(".cc-base-opt").forEach((el) => {
      const text = (el.dataset.value + " " + (el.dataset.hint || "")).toLowerCase();
      const match = text.includes(q);
      el.style.display = match ? "" : "none";
      if (match) anyVisible = true;
    });
    const existing = baseOptionsEl.querySelector(".cc-base-empty");
    if (existing) existing.remove();
    if (!anyVisible) {
      const empty = document.createElement("div");
      empty.className = "cc-base-empty";
      empty.textContent = "No results";
      baseOptionsEl.appendChild(empty);
    }
  }

  function selectBaseValue(value) {
    const prev = baseSelectedValue;
    baseSelectedValue = value;
    baseTrigger.textContent = value;
    baseOptionsEl.querySelectorAll(".cc-base-opt").forEach((o) => {
      o.classList.toggle("selected", o.dataset.value === value);
    });
    closeBaseDropdown();
    if (prev !== value && editingCode) {
      rateInput.value = "";
      showMsg("Base changed - enter new rate", "");
    }
  }

  function setBaseValue(value) {
    baseSelectedValue = value;
    baseTrigger.textContent = value;
    baseOptionsEl.querySelectorAll(".cc-base-opt").forEach((o) => {
      o.classList.toggle("selected", o.dataset.value === value);
    });
  }

  baseTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (baseSdEl.classList.contains("open")) {
      closeBaseDropdown();
    } else {
      openBaseDropdown();
    }
  });

  basePanel.addEventListener("click", (e) => e.stopPropagation());

  baseSearchInput.addEventListener("input", () => {
    filterBaseOptions(baseSearchInput.value);
  });

  baseSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBaseDropdown();
  });

  document.addEventListener("click", () => closeBaseDropdown());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBaseDropdown();
  });

  const result = await chrome.storage.local.get(["currency", "targetCurrency"]);
  const rates = result.currency?.rates || {};
  const savedTargetCurrency = result.targetCurrency || "USD";
  let customCurrencies = await loadCustomCurrencies();
  let editingCode = null;

  function populateBaseSelect() {
    const customCodes = new Set(Object.keys(customCurrencies));
    const bases = new Set(
      [...Object.keys(rates), "USD"].filter((c) => !customCodes.has(c))
    );
    const hintMap = {};
    if (typeof CURRENCY_INFORMATIONS !== "undefined") {
      CURRENCY_INFORMATIONS.forEach((c) => { if (c.abbr && c.hint) hintMap[c.abbr] = c.hint; });
    }
    baseOptionsEl.innerHTML = "";
    [...bases].sort().forEach((c) => {
      const opt = document.createElement("div");
      opt.className = "cc-base-opt";
      opt.dataset.value = c;
      if (hintMap[c]) opt.dataset.hint = hintMap[c];
      opt.textContent = c;
      opt.addEventListener("click", () => selectBaseValue(c));
      baseOptionsEl.appendChild(opt);
    });
    if (bases.has(savedTargetCurrency)) {
      setBaseValue(savedTargetCurrency);
    } else if (bases.has("USD")) {
      setBaseValue("USD");
    }
  }

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg ${type || ""}`;
    if (type === "ok") setTimeout(() => { msg.textContent = ""; }, 2000);
  }

  function findBaseOptionByValue(value) {
    return Array.from(baseOptionsEl.querySelectorAll(".cc-base-opt")).find(
      (el) => el.dataset.value === value
    ) || null;
  }

  function clearForm() {
    codeInput.value = "";
    nameInput.value = "";
    symbolInput.value = "";
    rateInput.value = "";
    const hasTarget = findBaseOptionByValue(savedTargetCurrency);
    setBaseValue(hasTarget ? savedTargetCurrency : "USD");
    editingCode = null;
    saveBtn.textContent = "Save";
    showMsg("");
    updateItemHighlights();
  }

  function fillForm(code, c) {
    if (editingCode === code) {
      clearForm();
      showMsg("Switched to add mode", "ok");
      return;
    }
    codeInput.value = code;
    nameInput.value = c.name;
    symbolInput.value = c.symbol || "";
    rateInput.value = c.rate;
    if (findBaseOptionByValue(c.baseCurrency)) {
      setBaseValue(c.baseCurrency);
    }
    editingCode = code;
    saveBtn.textContent = "Update";
    showMsg(`Editing ${code}`);
    codeInput.focus();
    updateItemHighlights();
  }

  function updateItemHighlights() {
    itemsContainer.querySelectorAll(".item").forEach((el) => {
      el.classList.toggle("editing", el.dataset.code === editingCode);
    });
  }

  function createItemEl(code, c) {
    const row = document.createElement("div");
    row.className = "item";
    row.dataset.code = code;
    row.addEventListener("click", () => fillForm(code, c));

    const emoji = document.createElement("span");
    emoji.className = "item-emoji";
    emoji.textContent = c.symbol || "";

    const body = document.createElement("div");
    body.className = "item-body";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = c.name;

    const meta = document.createElement("span");
    meta.className = "item-meta";
    meta.textContent = `${c.rate} ${c.baseCurrency}`;

    body.appendChild(name);
    body.appendChild(meta);

    const badge = document.createElement("span");
    badge.className = "item-code";
    badge.textContent = code;

    const del = document.createElement("button");
    del.className = "item-del";
    del.textContent = "\u00d7";
    del.title = "Delete";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      await removeCustomCurrency(code);
      customCurrencies = await loadCustomCurrencies();
      if (editingCode === code) clearForm();
      removeItemEl(code);
      updatePresetBtn(code, false);
      showMsg(`Removed ${code}`, "ok");
    });

    row.appendChild(emoji);
    row.appendChild(body);
    row.appendChild(badge);
    row.appendChild(del);
    return row;
  }

  function addItemEl(code, c) {
    const placeholder = itemsContainer.querySelector(".muted");
    if (placeholder) placeholder.remove();

    const el = createItemEl(code, c);
    el.style.animation = "itemIn 0.25s ease-out both";

    const items = [...itemsContainer.children];
    const insertBefore = items.find(
      (item) => item.dataset.code && item.dataset.code.localeCompare(code) > 0
    );
    if (insertBefore) {
      itemsContainer.insertBefore(el, insertBefore);
    } else {
      itemsContainer.appendChild(el);
    }
  }

  function removeItemEl(code) {
    const el = Array.from(itemsContainer.querySelectorAll("[data-code]")).find(
      (item) => item.dataset.code === code
    );
    if (!el) return;
    el.style.animation = "itemOut 0.2s ease-in forwards";
    el.addEventListener("animationend", () => {
      el.remove();
      if (!itemsContainer.children.length) {
        itemsContainer.innerHTML =
          '<p class="muted" style="text-align:center;padding:0.3rem 0">None yet</p>';
      }
    });
  }

  function updatePresetBtn(code, active) {
    const btn = Array.from(presetsContainer.querySelectorAll("[data-preset]")).find(
      (el) => el.dataset.preset === code
    );
    if (btn) btn.classList.toggle("active", active);
  }

  function renderPresets() {
    presetsContainer.innerHTML = "";
    CUSTOM_CURRENCY_PRESETS.forEach((p, i) => {
      const added = !!customCurrencies[p.code];
      const btn = document.createElement("button");
      btn.className = `preset${added ? " active" : ""}`;
      btn.dataset.preset = p.code;
      btn.textContent = `${p.symbol} ${p.name}`;
      btn.style.animationDelay = `${i * 0.03}s`;
      btn.addEventListener("click", async () => {
        const isAdded = !!customCurrencies[p.code];
        if (isAdded) {
          await removeCustomCurrency(p.code);
          customCurrencies = await loadCustomCurrencies();
          removeItemEl(p.code);
          updatePresetBtn(p.code, false);
          showMsg(`Removed ${p.name}`, "ok");
        } else {
          try {
            await upsertCustomCurrency(p);
            customCurrencies = await loadCustomCurrencies();
            addItemEl(p.code, customCurrencies[p.code]);
            updatePresetBtn(p.code, true);
            showMsg(`Added ${p.name}`, "ok");
          } catch (e) {
            showMsg(e.message, "err");
          }
        }
      });
      presetsContainer.appendChild(btn);
    });
  }

  function renderItems() {
    const entries = Object.entries(customCurrencies).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    itemsContainer.innerHTML = "";

    if (!entries.length) {
      itemsContainer.innerHTML =
        '<p class="muted" style="text-align:center;padding:0.3rem 0">None yet</p>';
      return;
    }

    entries.forEach(([code, c], i) => {
      const el = createItemEl(code, c);
      el.style.animationDelay = `${i * 0.04}s`;
      el.style.animation = "itemIn 0.25s ease-out both";
      itemsContainer.appendChild(el);
    });
  }

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const code = sanitizeCustomCurrencyCode(codeInput.value);
    const symbol = symbolInput.value.trim() || "\uD83C\uDF2E";
    const rate = Number(rateInput.value);

    if (!name) {
      showMsg("Enter a name", "err");
      nameInput.focus();
      return;
    }
    if (!code || code.length < 2) {
      showMsg("Enter a 2-8 letter code", "err");
      codeInput.focus();
      return;
    }
    if (!rate || rate <= 0) {
      showMsg("Enter a valid rate", "err");
      rateInput.focus();
      return;
    }

    if (editingCode && editingCode !== code) {
      await removeCustomCurrency(editingCode);
      removeItemEl(editingCode);
      updatePresetBtn(editingCode, false);
    }

    try {
      const wasEditing = editingCode;
      await upsertCustomCurrency({
        code, symbol, name, rate,
        baseCurrency: baseSelectedValue,
        places: 2,
      });
      customCurrencies = await loadCustomCurrencies();

      const existing = Array.from(itemsContainer.querySelectorAll("[data-code]")).find(
        (item) => item.dataset.code === code
      );
      if (existing) {
        const fresh = createItemEl(code, customCurrencies[code]);
        fresh.style.animation = "itemIn 0.2s ease-out both";
        existing.replaceWith(fresh);
      } else {
        addItemEl(code, customCurrencies[code]);
      }
      updatePresetBtn(code, true);

      showMsg(wasEditing ? `Updated ${code}` : `Saved ${code}`, "ok");
      clearForm();
    } catch (e) {
      showMsg(e.message, "err");
    }
  });

  clearBtn.addEventListener("click", clearForm);

  document.getElementById("back-btn").addEventListener("click", () => {
    document.body.classList.add("page-exit");
    setTimeout(() => { window.location.href = "./index.html"; }, 150);
  });

  document.getElementById("github-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://github.com/solidet-com/steam-currency-converter", active: false });
  });

  document.getElementById("solidet-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://linktr.ee/solidet", active: false });
  });

  populateBaseSelect();

  const defaultCodes = ["BMC", "DNR", "CFE"];
  if (!Object.keys(customCurrencies).length) {
    for (const code of defaultCodes) {
      const preset = CUSTOM_CURRENCY_PRESETS.find((p) => p.code === code);
      if (preset) {
        try { await upsertCustomCurrency(preset); } catch (_) {}
      }
    }
    customCurrencies = await loadCustomCurrencies();
  }

  renderPresets();
  renderItems();
});
