function initScript() {
  initItems();
  startObservers();
}

function initItems(onCurrencyChange = false) {
  let newItems = getItems(document, ...COMMON_SELECTORS);
  newItems?.forEach((item) => {
    initItem(item, onCurrencyChange);
    togglePrice(item);
  });
}

async function initStorage() {
  const converterActive = await getStoreValue("converterActive");
  if (converterActive == null) {
    await chrome.storage.local.set({ converterActive: true });
  }
}

async function initCurrency() {
  const targetCurrency = await getStoreValue("targetCurrency");
  const baseStoreCurrency = await getStoreValue("baseStoreCurrency");

  if (baseStoreCurrency == null) {
    baseCurrencykey = getStoreCurrency();

    await chrome.storage.local.set({ baseStoreCurrency: baseCurrencykey });
  }

  country = getSearchScriptCountry();
  const [currency, isDefault] = getCurrencyByCountryCode(country);

  if (!targetCurrency && (!country || isDefault)) {
    chrome.runtime.sendMessage({
      query: "openCurrencyInitPopup",
    });
  }

  if (!targetCurrency)
    await chrome.storage.local.set({ targetCurrency: currency });
}

async function prepareData() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  converterActive = toggleStatus.converterActive;

  let currency = await getStoreValue("currency");
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
      currency = await interval.callback(callbackPayload);
      if (interval?.afterCallbacks) {
        interval.afterCallbacks.forEach(async (afterCallback) => {
          currency = await afterCallback(callbackPayload);
        });
      }
    }
  }

  targetCurrencyRate = currency.rates[targetCurrencyKey] || 1;
}

initStorage().then(initCurrency).then(prepareData).then(initScript);
