const currencyURLs = {
  try: "https://finans.truncgil.com/v4/today.json",
  ars: "https://mercados.ambito.com/dolar/oficial/variacion",
};

const getCommonCurrencyEndpoint = (baseCurrencyKey = "USD") => {
  const baseURL = "https://open.er-api.com/v6/latest/";
  return `${baseURL}${baseCurrencyKey}`;
};

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

  let endpoint;
  switch (subkey) {
    case "all":
      endpoint = getCommonCurrencyEndpoint(payload?.baseCurrencyKey);
      break;
    default:
      endpoint = currencyURLs?.[subkey];
  }

  handleRequest(endpoint, sendResponse);
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
      onError && onError(error); // Send an error response if needed
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
      handleRequest(endpoint, sendResponse);
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
    if (versionPartsOld[0] != versionPartsNew[0]) {
      await chrome.storage.local.set({ showChangelog: true });
    }
  }
});
