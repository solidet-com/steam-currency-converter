const _suggestionTimers = new WeakMap();
const _commonSelectorStr = COMMON_SELECTORS.join(",");
const _suggestionSelectorStr = SEARCH_SUGGESTION_SELECTORS.join(",");
const _isInventoryOrCart = /\/(inventory|cart)/.test(window.location.href);

function processSearchSuggestionPanel(panel) {
  clearTimeout(_suggestionTimers.get(panel));
  _suggestionTimers.set(
    panel,
    setTimeout(() => {
      _suggestionTimers.delete(panel);
      Array.from(panel.querySelectorAll(_suggestionSelectorStr)).forEach(
        (item) => {
          initItem(item);
          togglePrice(item);
        }
      );
    }, 0)
  );
}

function handleContentMutation(mutationsList) {
  for (let i = 0; i < mutationsList.length; i++) {
    const { type, addedNodes, target } = mutationsList[i];

    if (type === "characterData") {
      const el = target.parentElement;
      if (!el) continue;
      const match = el.matches(_commonSelectorStr)
        ? el
        : el.closest(_commonSelectorStr);
      if (!match || !match.textContent.trim()) continue;
      if (
        match.getAttribute("data-ext-converted") === "true" &&
        match.getAttribute("data-ext-price-mem")
      )
        continue;
      initItem(match, true);
      togglePrice(match);
      continue;
    }

    if (type !== "childList") continue;

    for (let j = 0; j < addedNodes.length; j++) {
      const node = addedNodes[j];

      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || !node.textContent.trim()) continue;
        if (parent.matches(_commonSelectorStr)) {
          if (
            parent.getAttribute("data-ext-converted") === "true" &&
            parent.getAttribute("data-ext-price-mem")
          )
            continue;
          initItem(parent, true);
          togglePrice(parent);
        }
        continue;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (
        node.parentNode?.getAttribute("id") === "search_suggestion_contents"
      ) {
        getItems(node, SEARCH_ITEM_PRICE).forEach((item) => {
          initItem(item);
          togglePrice(item);
        });
        continue;
      }

      const panel =
        node.closest?.("[id^='searchSuggestions_']") ??
        (node.id?.startsWith("searchSuggestions_") ? node : null) ??
        node.querySelector?.("[id^='searchSuggestions_']");

      if (panel) {
        processSearchSuggestionPanel(panel);
        continue;
      }

      const items = Array.from(node.querySelectorAll(_commonSelectorStr));
      if (node.matches(_commonSelectorStr)) items.push(node);
      const filtered = items.filter((el) => el.textContent.trim());
      if (!filtered.length) continue;

      const timeout = _isInventoryOrCart ? 600 : 0;
      filtered.forEach((item) =>
        setTimeout(() => {
          initItem(item);
          togglePrice(item);
        }, timeout)
      );
    }
  }
}

const contentObserver = new MutationObserver(handleContentMutation);
observers.push(contentObserver);

function startObservers() {
  observers.forEach((observer) => {
    observer.observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });

  chrome.storage.onChanged.addListener(handleStorageMutation);
}

async function handleStorageMutation(changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "converterActive") {
      converterActive = newValue;
      togglePrices();
    } else if (key === "targetCurrency") {
      await loadCustomCurrencies();
      let storedData = await chrome.storage.local.get(["currency"]);
      targetCurrencyKey = newValue;
      targetCurrencyRate = storedData?.currency.rates[newValue] || 1;
      const storedConverter = converterActive;
      updateItems(storedConverter);
    } else if (key === "baseStoreCurrency") {
      if (!newValue) return;
      baseCurrencyKey = newValue;
      try {
        const currencyData = await updateRatesALL({
          baseCurrencyKey,
        });
        targetCurrencyRate = currencyData?.rates?.[targetCurrencyKey] || 1;
      } catch (error) {
        logger(`Storage mutation rate update failed: ${error?.message}`);
      }
      const storedConverter = converterActive;
      updateItems(storedConverter);
    } else if (key === "taxValue") {
      tax = newValue;
      const storedConverter = converterActive;
      updateItems(storedConverter);
    } else if (key === "customCurrencies") {
      await loadCustomCurrencies();
      await syncCustomCurrencyRates();
    } else if (key === "currency") {
      const freshRate = newValue?.rates?.[targetCurrencyKey];
      if (freshRate && freshRate !== targetCurrencyRate) {
        targetCurrencyRate = freshRate;
        updateItems(converterActive);
      }
    }
  }
}
