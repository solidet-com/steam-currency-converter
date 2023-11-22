const queryUrlMatch = {
    queryCurrency: "https://api.exchangerate-api.com/v4/latest/USD",
    queryTRY: "https://finans.truncgil.com/v4/today.json",
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const queryUrl = queryUrlMatch?.[request?.contentScriptQuery];
    if (!queryUrl) return;

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
