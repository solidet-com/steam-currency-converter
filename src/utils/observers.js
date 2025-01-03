function handleContentMutation(mutationsList) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node.parentNode?.getAttribute("id") == "search_suggestion_contents"
          ) {
            newItems = getItems(node, SEARCH_ITEM_PRICE);
          } else newItems = getItems(node, ...COMMON_SELECTORS);
          if (newItems.length > 0) {
            newItems.forEach((item) => {
              let timeout = 0;
              if (window.location.href.match(/\/(inventory|cart)/)) {
                timeout = 600;
              }
              setTimeout(() => {
                initItem(item);
                togglePrice(item);
              }, timeout);
            });
          }
        }
      });
    }
  });
}

const contentObserver = new MutationObserver(handleContentMutation);
observers.push(contentObserver);

function startObservers() {
  observers.forEach((observer) => {
    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

  chrome.storage.onChanged.addListener(handleStorageMutation);
}

async function handleStorageMutation(changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key.match("converterActive")) {
      converterActive = newValue;
      togglePrices();
    } else if (key.match("targetCurrency")) {
      let storedData = await chrome.storage.local.get(["currency"]);
      targetCurrencyKey = newValue;
      targetCurrencyRate = storedData?.currency.rates[newValue] || 1;
      const storedConverter = converterActive;
      updateItems(storedConverter);
    }
    //TODO: Get new currency Rates and refresh prices on items accordingly
    else if (key.match("baseStoreCurrency")) {
      if (!newValue) return;
      baseCurrencyKey = newValue;
      const currencyData = await updateRatesALL({
        baseCurrencyKey,
      });
      targetCurrencyRate = currencyData.rates[targetCurrencyKey] || 1;
      const storedConverter = converterActive;
      updateItems(storedConverter);
    } else if (key.match("taxValue")) {
      tax = newValue;
      const storedConverter = converterActive;
      updateItems(storedConverter);
    }
  }
}
