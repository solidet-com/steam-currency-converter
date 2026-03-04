async function injectResourcefulScript() {
  window.addEventListener("message", handlePageEvent, false);

  var node = document.getElementsByTagName("body")[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute(
    "src",
    chrome.runtime.getURL("/src/utils/resourceful.js")
  );
  node.appendChild(script);
  logger("Resourceful script injected");
}

async function populateResourcefulData(){
  [loaderData, UserConfig] = await Promise.all([
    getPageVariable("SSR.loaderData"),
    getPageVariable("UserConfig"),
  ]);
  if(loaderData) storeBrowseContext = loaderData[0]?.storeBrowseContext;

}

async function initScript() {
  initItems();
  startObservers();

  const showChangelog = await getStoreValue("showChangelog");
  if (showChangelog && !isIframe()) {
    showChangelogModal(
      "Steam Currency Converter v1.0.60",
      `<p>What's new in this update:</p>
      <br/>
      <p><strong>Custom Currencies</strong></p>
      <ul>
        <li>Create your own currencies — BigMac, Doner, Coffee, or anything you want</li>
        <li>Preset quick-add buttons for popular fun currencies</li>
        <li>Set custom exchange rates based on any supported base currency</li>
        <li>Prices display with emoji on the left and code on the right</li>
        <li>Edit or remove custom currencies anytime from the extension popup</li>
        <li>Live updates — changes reflect on Steam pages immediately</li>
      </ul>
      <br/>
      <p><strong>UI Improvements</strong></p>
      <ul>
        <li>Modernized dropdown selects with dark theme</li>
        <li>Smoother animations and transitions throughout</li>
        <li>Better currency selection labels for custom currencies</li>
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
    try {
      const timeStorageKey = getUpdateDateKey(interval.timeKey);
      let updatedDate = await chrome.storage.local.get([timeStorageKey]);

      const lastRefresh = updatedDate[timeStorageKey];
      const isInitial = lastRefresh == null;
      const diff = new Date().getTime() - lastRefresh;

      const callbackPayload = {
        baseCurrencyKey,
      };

      if (isInitial || diff > interval.value) {
        const result = await interval.callback(callbackPayload);
        if (result) currencyData = result;
        if (interval?.afterCallbacks) {
          for (const afterCallback of interval.afterCallbacks) {
            const afterResult = await afterCallback(callbackPayload);
            if (afterResult) currencyData = afterResult;
          }
        }
      }
    } catch (error) {
      logger(`Interval ${interval.timeKey} failed: ${error?.message}`);
    }
  }

  targetCurrencyRate = currencyData?.rates?.[targetCurrencyKey] || 1;
}
injectResourcefulScript().then(waitResourcefulToLoad).then(populateResourcefulData).then(loadCustomCurrencies).then(initCurrency).then(prepareData).then(initScript);
