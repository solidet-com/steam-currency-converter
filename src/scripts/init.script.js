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
      `Steam Currency Converter v${getManifest().version}`,
      `<p>What's new in this update:</p>
      <br/>
      <p><strong>Works with Steam's new pages</strong></p>
      <ul>
        <li>Prices convert again on Steam's redesigned pages: store front, charts, tags, categories, wishlist and cart</li>
        <li>New Community Market and inventory pages, including "From" and "Starting at" prices</li>
        <li>Wallet balance in Steam's new header</li>
        <li>Subscription terms, e.g. GTA+ "at checkout, auto-renewed" prices</li>
        <li>Keeps working when Steam changes its page layout</li>
      </ul>
      <br/>
      <p><strong>Fixes</strong></p>
      <ul>
        <li>Indonesian Rupiah (IDR) prices are converted correctly</li>
        <li>Text next to prices keeps its spacing, e.g. "Free To Play" and "Starting at:"</li>
        <li>Prices shown by other extensions (Augmented Steam, SteamDB, ITAD) are left untouched</li>
      </ul>
      <br/>
      <em>Enjoy the extension and feel free to give feedback or report bugs.</em>
      `
    );
  }
}

function initItems(onCurrencyChange = false) {
  const newItems = collectPriceItems([document.body]);
  // Converted prices no longer show the store currency, find them by mark.
  if (onCurrencyChange)
    document
      .querySelectorAll("[data-ext-converted]")
      .forEach((item) => newItems.add(item));
  newItems.forEach((item) => {
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
