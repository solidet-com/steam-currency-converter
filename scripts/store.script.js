function initScript() {
  initItems();
  startObservers();
}

function initItems(onCurrencyChange = false) {
  let newItems = getItems(document, ...COMMON_SELECTORS);
  if (newItems?.length > 0) {
    newItems.forEach((item) => {
      initItem(item, onCurrencyChange);
      togglePrice(item);
    });
  }
}

async function initStorage() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  if (toggleStatus?.converterActive == null) {
    await chrome.storage.local.set({ converterActive: true });
  }
}

async function initCurrency() {
  const savedCurrency = await chrome.storage.local.get("targetCurrency");
  const { baseStoreCurrency } = await chrome.storage.local.get("baseStoreCurrency");

  if (baseStoreCurrency == null) {
    baseCurrency = getStoreCurrency();

    await chrome.storage.local.set({ baseStoreCurrency: baseCurrency });
  }

  const countryCode = getSearchScriptCountry();
  const [currency, isDefault] = getCurrencyByCountryCode(countryCode);

  if (!savedCurrency?.targetCurrency && (!countryCode || isDefault)) {
    chrome.runtime.sendMessage({
      contentScriptQuery: "openCurrencyInitPopup",
    });
  }

  if (!savedCurrency.targetCurrency)
    await chrome.storage.local.set({ targetCurrency: currency });
}

async function prepareData() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  converterActive = toggleStatus.converterActive;

  let storedData = await chrome.storage.local.get(["currency"]);
  let { taxValue } = await chrome.storage.local.get(["taxValue"]);
  let { targetCurrency } = await chrome.storage.local.get(["targetCurrency"]);
  let { baseStoreCurrency } = await chrome.storage.local.get([
    "baseStoreCurrency",
  ]);
  queryUrlMatch.queryCurrency = `https://open.er-api.com/v6/latest/${baseStoreCurrency}`;
console.log("queryUrlMatch.queryCurrency",queryUrlMatch.queryCurrency)
  for (const interval of INTERVALS) {
    const timeStorageKey = getUpdateDateKey(interval.timeKey);
    let updatedDate = await chrome.storage.local.get([timeStorageKey]);

    const lastRefresh = updatedDate[timeStorageKey];
    const isInitial = lastRefresh == null;
    const diff = new Date().getTime() - lastRefresh;

    if (isInitial || diff > interval.value) {
      storedData = await interval.callback();
      if (interval?.afterCallbacks) {
        interval.afterCallbacks.forEach(async (afterCallback) => {
          storedData = await afterCallback();
        });
      }
    }
  }
  currencyRate = storedData.currency.rates[targetCurrency]||1;
  currencyKey = targetCurrency;
  tax = taxValue;
  baseCurrency = baseStoreCurrency;
}

initStorage().then(initCurrency).then(prepareData).then(initScript);
