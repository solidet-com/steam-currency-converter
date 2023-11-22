function convertToLocalCurrency(basePrice) {
    if (exchangeRatePromise) {
        const tryPrice = basePrice * exchangeRatePromise;
        return "₺" + tryPrice.toFixed(2);
    } else {
        console.error("Exchange rates not available.");
        return null;
    }
}

async function handleQueryCommonHead(query) {
    const currencyDataPromise = chrome.runtime.sendMessage({
        contentScriptQuery: query,
    });

    const currencyData = await currencyDataPromise;

    if (chrome.runtime.lastError) {
        console.error(`Error: ${chrome.runtime.lastError.message}`);
        return;
    }

    return currencyData;
}

async function handleQueryCommonTail(rates, updateKey) {
    const lastCurrencyPayload = {
        currency: {
            rates: rates,
        },
    };

    const lastTimePayload = {
        [getUpdateDateKey(updateKey)]: new Date().getTime(),
    };

    await chrome.storage.local.set(lastCurrencyPayload);
    await chrome.storage.local.set(lastTimePayload);

    return lastCurrencyPayload;
}

function getUpdateDateKey(updateKey) {
    return `update${updateKey}Date`;
}
