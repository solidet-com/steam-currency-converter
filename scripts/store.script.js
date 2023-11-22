let newItems = getItems(document, ...COMMON_SELECTORS);
function initScript() {
    if (newItems?.length > 0) {
        newItems.forEach((item) => {
            initItem(item);
            togglePrice(item);
        });
    }
    startObservers();
}

async function initStorage() {
    const toggleStatus = await chrome.storage.local.get(["converterActive"]);
    if (toggleStatus?.converterActive == null) {
        await chrome.storage.local.set({ converterActive: true });
    }
}

async function prepareData() {
    const toggleStatus = await chrome.storage.local.get(["converterActive"]);
    converterActive = toggleStatus.converterActive;
    let storedData = await chrome.storage.local.get(["currency"]);

    for (const interval of INTERVALS) {
        const timeStorageKey = getUpdateDateKey(interval.timeKey);
        let updatedDate = await chrome.storage.local.get([timeStorageKey]);

        const lastRefresh = updatedDate[timeStorageKey];
        const isInitial = lastRefresh == null;
        const diff = new Date().getTime() - lastRefresh;

        if (isInitial || diff > interval.value) {
            storedData = await interval.callback();
            if (interval?.afterCallback) {
                storedData = await interval.afterCallback();
            }
        }
    }

    exchangeRatePromise = storedData.currency.rates.TRY;
}

initStorage().then(prepareData).then(initScript);
