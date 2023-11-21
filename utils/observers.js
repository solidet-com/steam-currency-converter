function handleContentMutation(mutationsList) {
    mutationsList.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.parentNode?.getAttribute("id") == "search_suggestion_contents") {
                        newItems = getItems(node, SEARCH_ITEM_PRICE);
                    } else newItems = getItems(node, ...COMMON_SELECTORS);
                    if (newItems.length > 0) {
                        newItems.forEach((item) => {
                            initItem(item);
                            togglePrice(item);
                        });
                    }
                }
            });
        }
    });
}

const contentObserver = new MutationObserver(handleContentMutation);
observers.push(contentObserver);


function startObservers() {
    observers.forEach((observer) => {
        observer.observe(document, { childList: true, subtree: true });
    });
}

function handleStorageMutation(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key.match("converterActive")) {
            console.log("converter active changed");
            converterActive = newValue;
            togglePrices();
        }
    }
}

chrome.storage.onChanged.addListener(handleStorageMutation);
