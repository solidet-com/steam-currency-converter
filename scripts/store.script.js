let newItems = getItems(
  document,
  ...COMMON_SELECTORS
);

chrome.runtime.sendMessage({ contentScriptQuery: "queryCurrency" }, (data) => {
  if (chrome.runtime.lastError) {
    console.log("Error happened:");
    console.log(`Error: ${chrome.runtime.lastError.message}`);
    return;
  }

  exchangeRatePromise = data.rates.TRY;
  if (newItems.length > 0) {
    newItems.forEach((item) => {
      updatePriceInLocalCurrency(item);
    });
  }
  startObservers();
});
