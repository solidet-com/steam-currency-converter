function handlePageEvent(event) {
  if (event.source !== window) return;
  const { type, data } = event.data;

  if (type?.startsWith("steamcc-from-page")) {
    const [_prefix, eventName] = type.split("steamcc-from-page:");

    switch (eventName) {
      case PAGE_EVENTS.GET_PAGE_VAR:
        RESOURCE_MAP[data.resourceId].completed = true;
        RESOURCE_MAP[data.resourceId].data = data.payload;
        return true;
      case PAGE_EVENTS.SCRIPT_LOADED:
        isResourcefulScriptLoaded = true;
        logger("Resourceful script loaded");
        return true;
    }
  }
}

async function waitResourcefulToLoad() {
  while (!isResourcefulScriptLoaded) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function getPageVariable(key) {
  const resourceId = `${PAGE_EVENTS.GET_PAGE_VAR}:${key}`;

  RESOURCE_MAP[resourceId] = {
    completed: false,
  };

  dispatchPageEvent(PAGE_EVENTS.GET_PAGE_VAR, {
    resourceId,
    key,
  });

  await waitUntilResourceIsFetched(resourceId);

  if (!RESOURCE_MAP[resourceId].completed || !RESOURCE_MAP[resourceId].data)
    return null;

  return JSON.parse(RESOURCE_MAP[resourceId].data);
}

async function waitUntilResourceIsFetched(resourceId, timeout = 5000) {
  const startTime = Date.now();
  while (!RESOURCE_MAP[resourceId].completed) {
    if (Date.now() - startTime > timeout) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function getDispatchPayload(event, payload) {
  return {
    detail: safeStringify({
      type: `steamcc-to-page:${event}`,
      data: payload,
    }),
  };
}


function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return; 
      }
      seen.add(value);
    }
    return value;
  });
}


function getCurrencyFormat(currencyKey) {
  const defaultFormat = {
    places: 2,
    hidePlacesWhenZero: false,
    symbolFormat: null,
    thousand: ",",
    decimal: ".",
    right: false,
  };

  const currency = CURRENCY_INFORMATIONS.find(
    (currency) => currency.abbr === currencyKey
  );

  return currency?.format || defaultFormat;
}

function numberWithCommas(x, { thousandSeparator, decimalSeparator }) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  return parts.join(decimalSeparator);
}
function logger(message) {
  console.log(
    `%c[Steam Currency Converter]: %c${message}`,
    "color: #00aaff; font-weight: bold;",
    "color: #f36f63;"
  );
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function getManifest() {
  const manifest = chrome.runtime.getManifest();
  return manifest;
}

async function handleBaseCurrencyKey() {
  const savedLoginStatus = await getStoreValue("loginStatus");
  const savedCountry = await getStoreValue("country");

  const loginStatus = isUserLoggedIn();
  if (
    savedLoginStatus != loginStatus ||
    savedCountry != country ||
    baseCurrencyKey == null
  ) {
    if (savedLoginStatus && savedLoginStatus != loginStatus)
      logger("Login Status has been changed, checking Steam Store Currency!");
    else if (savedCountry && savedCountry != country)
      logger("Country has been changed, checking Steam Store Currency!");

    setLoginStatus(loginStatus);
    baseCurrencyKey = await getStoreCurrency();
    const currencyData = await updateRatesALL({ baseCurrencyKey });
    targetCurrencyRate = currencyData.rates[targetCurrencyKey] || 1;
    await chrome.storage.local.set({ baseStoreCurrency: baseCurrencyKey });
  }
}
const get = (obj, path) => {
  const parts = path.split(".");
  return parts.reduce((acc, part) => acc[part], obj);
};

const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay));

function isIframe() {
  return window != window.top;
}

async function handleIframe(timeout = 5000) {
  return new Promise(async (resolve, reject) => {
    let elapsedTime = 0;
    while (!(await isDataSet()) && elapsedTime < timeout) {
      await wait(500);
      elapsedTime += 500;
    }
    if (elapsedTime >= timeout)
      reject(
        "IFrame script ran before data was initialized. Aborting IFrame conversion."
      );
    resolve();
  });
}

