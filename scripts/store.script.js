let newItems = getItems(document, ...COMMON_SELECTORS);
function initScript() {
  if (newItems?.length > 0) {
    newItems.forEach((item) => {
      initItem(item);
   
      if (converterActive) togglePrices();
    });
  }
  startObservers();
}

async function prepareData() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  const storedData = await chrome.storage.local.get(["currency"]);

  if (
    storedData?.currency?.updateDate !== new Date().toLocaleDateString("en-GB")
  ) {
    const currencyDataPromise = chrome.runtime.sendMessage({
      contentScriptQuery: "queryCurrency",
    });

    const currencyData = await currencyDataPromise;

    if (chrome.runtime.lastError) {
      console.error(`Error: ${chrome.runtime.lastError.message}`);
      return;
    }

    exchangeRatePromise = currencyData.rates.TRY;


    // Update local storage with the retrieved currency data
    chrome.storage.local.set({
      currency: {
        rates: currencyData.rates,
        updateDate: new Date().toLocaleDateString("en-GB"),
      },
    });
  } else {
    exchangeRatePromise = storedData.currency.rates.TRY;

    converterActive = toggleStatus.converterActive;
  }

  // Get the list of items
}

prepareData().then((result) => {
  initScript();
});
