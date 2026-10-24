const _suggestionTimers = new WeakMap();
const _commonSelectorStr = COMMON_SELECTORS.join(",");
const _isInventoryOrCart = /\/(inventory|cart)/.test(window.location.href);

function processSearchSuggestionPanel(panel) {
  clearTimeout(_suggestionTimers.get(panel));
  _suggestionTimers.set(
    panel,
    setTimeout(() => {
      _suggestionTimers.delete(panel);
      collectPriceItems([panel]).forEach((item) => convertItem(item));
    }, 0)
  );
}

function convertItem(item, update = false) {
  initItem(item, update);
  togglePrice(item);
}

// Text changes are converted right away. New prices always contain a digit
// and the store currency, so other text changes (countdown timers, counters)
// are skipped before any DOM lookups. Converted prices are always rechecked.
function collectChangedTextItem(textNode, items) {
  const text = textNode.nodeValue;
  const parent = textNode.parentElement;
  if (!parent || !text.trim()) return;
  if (parent.hasAttribute("data-ext-converted")) {
    // Every price this extension writes comes back here, skip those first.
    if (isOwnPriceWrite(parent)) return;
  } else if (!hasPriceHint(text)) return;
  const match = resolvePriceItem(textNode);
  if (
    match &&
    match.textContent.trim() &&
    !isOwnPriceWrite(match) &&
    canReconvert(match)
  )
    items.add(match);
}

// Stops re-converting an element whose text is reset over and over (e.g. by
// a page script fighting the conversion), so it can't loop and freeze a tab.
const _reconversions = new WeakMap();

function canReconvert(item) {
  const now = Date.now();
  const entry = _reconversions.get(item);
  if (!entry || now - entry.since > 1000) {
    _reconversions.set(item, { since: now, count: 1 });
    return true;
  }
  return ++entry.count <= 10;
}


function handleContentMutation(mutationsList) {
  const changedItems = new Set();
  const addedRoots = new Set();

  for (const { type, addedNodes, target } of mutationsList) {
    if (type === "characterData") {
      collectChangedTextItem(target, changedItems);
      continue;
    }
    if (type !== "childList") continue;

    for (const node of addedNodes) {
      if (node.nodeType === Node.TEXT_NODE)
        collectChangedTextItem(node, changedItems);
      else if (node.nodeType === Node.ELEMENT_NODE) addedRoots.add(node);
    }
  }

  changedItems.forEach((item) => convertItem(item, true));

  const scanRoots = [];
  for (const node of addedRoots) {
    // Skip nodes React already removed. A node whose parent was also added
    // is scanned with its parent (deeper nesting is only scanned twice).
    if (!node.isConnected || addedRoots.has(node.parentElement)) continue;

    if (
      node.parentNode?.getAttribute?.("id") === "search_suggestion_contents"
    ) {
      getItems(node, SEARCH_ITEM_PRICE).forEach((item) => convertItem(item));
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

    scanRoots.push(node);
  }

  const newItems = collectPriceItems(scanRoots);
  if (!newItems.size) return;

  const timeout = _isInventoryOrCart ? 600 : 0;
  setTimeout(() => {
    newItems.forEach((item) => item.isConnected && convertItem(item));
  }, timeout);
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
