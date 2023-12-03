const queryUrlMatch = {
    queryCurrency: "https://api.exchangerate-api.com/v4/latest/USD",
    queryTRY: "https://finans.truncgil.com/v4/today.json",
    queryARS: "https://mercados.ambito.com/dolar/oficial/variacion"
};

const query = {
    openCurrencyInitPopup: function () {
        if (typeof chrome.action.openPopup === "function") {
            console.log("Open the popup");
            chrome.action.openPopup({}, function () {
                console.log("Popup opened");
            });
        } else {
            console.log("chrome.action.openPopup() not supported");

            chrome.tabs.create({ url: "choose-currency.html" }, function (window) {});
        }

        return true;
    },
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const queryUrl = queryUrlMatch?.[request?.contentScriptQuery];
    const callback = query[request?.contentScriptQuery];

    if (!queryUrl && !callback) return;

    if (callback) return callback(sendResponse);

    fetch(queryUrl)
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
