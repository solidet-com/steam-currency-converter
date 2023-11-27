function convertToLocalCurrency(basePrice) {
  if (currencyRate) {
    let targetPrice = basePrice * currencyRate;
    if (tax > 0) targetPrice += targetPrice * (tax / 100);
    return (
      currencySymbolMap[currencyKey] + numberWithCommas(targetPrice.toFixed(2))
    );
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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

async function updateItems(storedConverter) {
  if (storedConverter) {
    await chrome.storage.local.set({ converterActive: false });
  }
  initItems(true);
  if (storedConverter) {
    await chrome.storage.local.set({ converterActive: true });
  }
}
