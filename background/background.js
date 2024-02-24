const queryUrlMatch = {
    queryTRY: "https://finans.truncgil.com/v4/today.json",
    queryARS: "https://mercados.ambito.com/dolar/oficial/variacion",
};

const getCommonEndpoint = (baseCurrencykey = "USD") => `https://open.er-api.com/v6/latest/${baseCurrencykey}`;
const getBaseCurrencyEndpoint = (appId = "105600", country = "") =>
    `https://store.steampowered.com/api/appdetails/?appids=${appId}&cc=${country}&filters=price_overview`;

const query = {
    openCurrencyInitPopup: function () {
        if (typeof chrome.action.openPopup === "function") {
            console.log("Open the popup");
            chrome.action.openPopup({}, function () {
                console.log("Popup opened");
            });
        } else {
            console.log("chrome.action.openPopup() not supported");

            chrome.tabs.create({ url: "./pages/choose-currency.html" }, function (window) {});
        }

        return true;
    },
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let endpoint;
    if (request?.query === "queryCurrency") {
        console.log("request", request);
        endpoint = getCommonEndpoint(request?.payload?.baseCurrencykey);
    } else if (request?.query === "queryBaseCurrency") {
        console.log("received request payload is", request);
        endpoint = getBaseCurrencyEndpoint(request?.payload?.appId, request?.payload?.country);
        console.log("sending request to");
        console.log(endpoint);
    } else {
        endpoint = queryUrlMatch?.[request?.query];
    }

    const callback = query[request?.query];
    if (callback) return callback(sendResponse);

    if (!endpoint) return;

    fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Return the JSON promise directly
        })
        .then(sendResponse)
        .catch((error) => {
            sendResponse({ error: error.message }); // Send an error response if needed
        });
    return true;
});

chrome.runtime.onInstalled.addListener(async function (details) {
    if (details.reason == "install") {
        await chrome.storage.local.set({ converterActive: true, showChangelog: true });

        // TODO: Thank the user for installing the extension
    } else if (details.reason == "update") {
        var versionPartsOld = details.previousVersion.split(".");
        var versionPartsNew = chrome.runtime.getManifest().version.split(".");
        if (versionPartsOld[0] != versionPartsNew[0]) {
            await chrome.storage.local.set({ showChangelog: true });
        }
    }
});
