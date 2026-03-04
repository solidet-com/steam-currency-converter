const currencyURLs = {
  try: "https://finans.truncgil.com/v4/today.json",
  ars: "https://mercados.ambito.com/dolar/oficial/variacion",
};

const currencyAllEndpoints = [
  {
    name: "open.er-api",
    getURL: (base = "USD") => `https://open.er-api.com/v6/latest/${base}`,
    normalize: (data) => ({ rates: data?.rates }),
  },
  {
    name: "frankfurter",
    getURL: (base = "USD") =>
      `https://api.frankfurter.dev/v1/latest?base=${base}`,
    normalize: (data) => ({ rates: data?.rates }),
  },
  {
    name: "fawazahmed0-currency-api",
    getURL: (base = "USD") =>
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`,
    normalize: (data, base = "USD") => {
      const key = base.toLowerCase();
      const rawRates = data?.[key];
      if (!rawRates) return null;
      const rates = {};
      for (const [k, v] of Object.entries(rawRates)) {
        if (typeof v === "number") {
          rates[k.toUpperCase()] = v;
        }
      }
      return { rates };
    },
  },
];

const getGamePriceEndpoint = (appId = "105600", country = "") => {
  const baseURL = "https://store.steampowered.com/api/appdetails/";
  return `${baseURL}?appids=${appId}&cc=${country}&filters=price_overview`;
};

const methods = {
  openCurrencyInitPopup: function () {
    chrome.tabs.create(
      { url: "./pages/choose-currency.html" },
      function (window) {}
    );

    return true;
  },
};

const handleGetCurrency = (request, sendResponse) => {
  const [_key, subkey] = request?.event?.split(":");
  const { payload } = request;

  if (subkey === "all") {
    handleGetCurrencyAll(payload?.baseCurrencyKey, sendResponse);
  } else {
    const endpoint = currencyURLs?.[subkey];
    if (!endpoint) {
      sendResponse({ error: true, message: `Unknown currency subkey: ${subkey}` });
      return;
    }
    handleRequest(endpoint, sendResponse, (error) => {
      console.warn(`[SCC] Currency API failed for "${subkey}":`, error?.message);
      sendResponse({ error: true, message: error?.message });
    });
  }
};

const handleGetCurrencyAll = async (baseCurrencyKey, sendResponse) => {
  for (const source of currencyAllEndpoints) {
    try {
      const url = source.getURL(baseCurrencyKey);
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(
          `[SCC] ${source.name} returned HTTP ${response.status}, trying next source...`
        );
        continue;
      }

      const data = await response.json();
      const normalized = source.normalize(data, baseCurrencyKey);

      if (!normalized?.rates || Object.keys(normalized.rates).length === 0) {
        console.warn(
          `[SCC] ${source.name} returned empty rates, trying next source...`
        );
        continue;
      }

      console.log(`[SCC] Currency rates loaded from ${source.name}`);
      sendResponse(normalized);
      return;
    } catch (error) {
      console.warn(
        `[SCC] ${source.name} failed: ${error?.message}, trying next source...`
      );
      continue;
    }
  }

  console.error("[SCC] All currency API sources failed!");
  sendResponse({ error: true, message: "All currency API sources failed" });
};

const handleRequest = (endpoint, onSuccess, onError) => {
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Return the JSON promise directly
    })
    .then(onSuccess)
    .catch((error) => {
      if (onError) {
        onError(error);
      } else {
        console.error(`[SCC] Request failed:`, error?.message);
        onSuccess({ error: true, message: error?.message });
      }
    });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const [key, _subkey] = request?.event?.split(":");
  const { payload } = request;

  switch (key) {
    case "get-currency":
      handleGetCurrency(request, sendResponse);
      break;
    case "fetch":
      const endpoint = getGamePriceEndpoint(payload?.appId, payload?.country);
      handleRequest(endpoint, sendResponse, (error) => {
        console.warn(`[SCC] Game price fetch failed:`, error?.message);
        sendResponse({ error: true, message: error?.message });
      });
      break;
    default:
      if (methods[key]) {
        methods[key](request, sendResponse);
      }
      break;
  }

  return true;
});

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason == "install") {
    await chrome.storage.local.set({
      converterActive: true,
      showChangelog: true,
    });
  } else if (details.reason == "update") {
    var versionPartsOld = details.previousVersion.split(".");
    var versionPartsNew = chrome.runtime.getManifest().version.split(".");
    if (
      versionPartsOld[0] !== versionPartsNew[0] ||
      versionPartsOld[1] !== versionPartsNew[1] ||
      versionPartsOld[2] !== versionPartsNew[2]
    ) {
      await chrome.storage.local.set({ showChangelog: true });
    }
  }
});
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-prices") {
    let { converterActive } = await chrome.storage.local.get([
      "converterActive",
    ]);
    chrome.storage.local.set({ converterActive: !converterActive });
  }
});
