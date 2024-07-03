async function initScript() {
  initItems();
  startObservers();

  const showChangelog = await getStoreValue("showChangelog");
  if (showChangelog && !isIframe()) {
    showChangelogModal(
      "Steam Currency Converter v1.0.0!",
      `<p>Thank you for using Steam Currency Converter. This extension will help you to see the price of the games in your local currency.</p>
      <br/>
      <p>Key features:</p>
      <ul>
        <li>Exchange all the currencies that Steam uses to over 160 currencies.</li>
        <li>Hot-Toggle Exchange Rates (Extension Menu or Shift + Alt + Q) (<em>Thanks to Doğucan Gelbal</em>)</li>
        <li>Set extra rate percentage</li>
        <li>Auto locale detection</li>
        <li>Up-to-date Currency Rates</li>
      </ul>
      <br/>
      <em>Enjoy the extension and feel free to give feedback or report bugs.</em>
      `
    );
  }
}

function initItems(onCurrencyChange = false) {
  let newItems = getItems(document, ...COMMON_SELECTORS);
  newItems?.forEach((item) => {
    initItem(item, onCurrencyChange);
    togglePrice(item);
  });
}

async function initCurrency() {
  const targetCurrency = await getStoreValue("targetCurrency");
  baseCurrencyKey = await getStoreValue("baseStoreCurrency");
  if (isIframe()) return await handleIframe();

  country = getUserCountry();

  await handleBaseCurrencyKey();

  const [currencyKey, isDefault] = getCurrencyByCountryCode(country);

  if ((!targetCurrency || !baseCurrencyKey) && (!country || isDefault)) {
    dispatchBackgroundEvent("openCurrencyInitPopup");
  }
  chrome.storage.local.set({ country });

  if (!targetCurrency)
    await chrome.storage.local.set({ targetCurrency: currencyKey });
}

async function prepareData() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  converterActive = toggleStatus.converterActive;

  let currencyData = await getStoreValue("currency");
  tax = await getStoreValue("taxValue");
  targetCurrencyKey = await getStoreValue("targetCurrency");
  baseCurrencyKey = await getStoreValue("baseStoreCurrency");

  for (const interval of INTERVALS) {
    const timeStorageKey = getUpdateDateKey(interval.timeKey);
    let updatedDate = await chrome.storage.local.get([timeStorageKey]);

    const lastRefresh = updatedDate[timeStorageKey];
    const isInitial = lastRefresh == null;
    const diff = new Date().getTime() - lastRefresh;

    const callbackPayload = {
      baseCurrencyKey,
    };

    if (isInitial || diff > interval.value) {
      currencyData = await interval.callback(callbackPayload);
      if (interval?.afterCallbacks) {
        interval.afterCallbacks.forEach(async (afterCallback) => {
          currencyData = await afterCallback(callbackPayload);
        });
      }
    }
  }

  targetCurrencyRate = currencyData.rates[targetCurrencyKey] || 1;
}
initCurrency().then(prepareData).then(initScript);

