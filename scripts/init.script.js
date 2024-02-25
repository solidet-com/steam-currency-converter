async function initScript() {
  initItems();
  startObservers();

  const showChangelog = await getStoreValue("showChangelog");
  if (showChangelog) {
    showChangelogModal(
      "Welcome to Steam Currency Converter",
      "We've made some changes to the extension. Check out the changelog to see what's new.",
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
  baseCurrencykey = await getStoreValue("baseStoreCurrency");
  country = getUserCountry();

  await handleBaseCurrencyKey();

  const [currencyKey, isDefault] = getCurrencyByCountryCode(country);

  if ((!targetCurrency || !baseCurrencykey) && (!country || isDefault)) {
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
  baseCurrencykey = await getStoreValue("baseStoreCurrency");

  for (const interval of INTERVALS) {
    const timeStorageKey = getUpdateDateKey(interval.timeKey);
    let updatedDate = await chrome.storage.local.get([timeStorageKey]);

    const lastRefresh = updatedDate[timeStorageKey];
    const isInitial = lastRefresh == null;
    const diff = new Date().getTime() - lastRefresh;

    const callbackPayload = {
      baseCurrencykey,
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
