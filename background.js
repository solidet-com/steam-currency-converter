chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery == "queryCurrency") {
    var url = `https://api.exchangerate-api.com/v4/latest/USD`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Return the JSON promise directly
      })
      .then((data) => {
        sendResponse(data);
      })
      .catch((error) => {
        sendResponse({ error: error.message }); // Send an error response if needed
      });
    return true; // Keep the message channel open
  } else if (request.contentScriptQuery == "queryTRY") {
    fetch("https://api.genelpara.com/embed/doviz.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Return the JSON promise directly
      })
      .then((data) => {
        sendResponse(data);
      })
      .catch((error) => {
        sendResponse({ error: error.message }); // Send an error response if needed
      });
    return true; // Keep the message channel open
  }
});
