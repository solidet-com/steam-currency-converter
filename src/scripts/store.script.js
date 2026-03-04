async function getStoreValue(key) {
  const value = await chrome.storage.local.get([key]);
  return value[key];
}

async function updateStorageRates(rates, updateKey) {
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
  await syncCustomCurrencyRates();

  const updatedCurrency = await chrome.storage.local.get(["currency"]);
  return updatedCurrency.currency;
}

function getUpdateDateKey(updateKey) {
  return `update${updateKey}Date`;
}
