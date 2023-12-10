function handleContentMutation(mutationsList) {
    mutationsList.filter(isChildListMutation).forEach(handleAddedNodes);
}

const contentObserver = new MutationObserver(handleContentMutation);
observers.push(contentObserver);

function startObservers() {
    observers.forEach((observer) => {
        observer.observe(document, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    });

    chrome.storage.onChanged.addListener(handleStorageMutation);
}

async function handleStorageMutation(changes, _namespace) {
    for (let [key, { newValue }] of Object.entries(changes)) {
        switch (key) {
            case "converterActive":
                converterStatusHandler({ newValue });
                break;
            case "targetCurrency":
                await targetCurrencyHandler({ newValue });
                break;
            case "taxValue":
                taxValueHandler({ newValue });
                break;
        }
    }
}
