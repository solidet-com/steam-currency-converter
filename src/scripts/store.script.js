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

  return lastCurrencyPayload?.currency;
}

function getUpdateDateKey(updateKey) {
  return `update${updateKey}Date`;
}
