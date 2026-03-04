document.addEventListener("DOMContentLoaded", async () => {
  const presetsContainer = document.getElementById("presets");
  const itemsContainer = document.getElementById("items");
  const msg = document.getElementById("msg");
  const baseSelect = document.getElementById("cc-base");
  const codeInput = document.getElementById("cc-code");
  const nameInput = document.getElementById("cc-name");
  const symbolInput = document.getElementById("cc-symbol");
  const rateInput = document.getElementById("cc-rate");
  const saveBtn = document.getElementById("save-btn");
  const clearBtn = document.getElementById("clear-btn");

  const result = await chrome.storage.local.get(["currency"]);
  const rates = result.currency?.rates || {};
  let customCurrencies = await loadCustomCurrencies();
  let editingCode = null;

  function populateBaseSelect() {
    const bases = new Set([...Object.keys(rates), "USD"]);
    baseSelect.innerHTML = "";
    [...bases].sort().forEach((c) => baseSelect.add(new Option(c, c)));
    if (bases.has("USD")) baseSelect.value = "USD";
  }

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg ${type || ""}`;
    if (type === "ok") setTimeout(() => { msg.textContent = ""; }, 2000);
  }

  function clearForm() {
    codeInput.value = "";
    nameInput.value = "";
    symbolInput.value = "";
    rateInput.value = "";
    baseSelect.value = "USD";
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
    if ([...baseSelect.options].some((o) => o.value === c.baseCurrency)) {
      baseSelect.value = c.baseCurrency;
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
    const el = itemsContainer.querySelector(`[data-code="${code}"]`);
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
    const btn = presetsContainer.querySelector(`[data-preset="${code}"]`);
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
        baseCurrency: baseSelect.value,
        places: 2,
      });
      customCurrencies = await loadCustomCurrencies();

      const existing = itemsContainer.querySelector(`[data-code="${code}"]`);
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

  baseSelect.addEventListener("change", () => {
    if (editingCode) {
      rateInput.value = "";
      showMsg("Base changed - enter new rate", "");
    }
  });

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
