async function dispatchBackgroundEvent(query, payload) {
  const eventPromise = chrome.runtime.sendMessage({
    query,
    payload,
  });

  const data = await eventPromise;

  if (chrome.runtime.lastError) {
    console.error(`Error: ${chrome.runtime.lastError.message}`);
    return;
  }

  return data;
}

async function handleQueryAll(payload) {
  const currencyData = await dispatchBackgroundEvent("queryCurrency", payload);
  return await updateStorageRates(currencyData.rates, TIME_KEY.ALL);
}

async function handleQueryTRY() {
  const currencyData = await dispatchBackgroundEvent("queryTRY");

  let currency = await getStoreValue("currency");

  if (currencyData[baseCurrencykey]) {
    currency.rates["TRY"] = parseFloat(
      currencyData[baseCurrencykey]["Selling"],
    );
  }

  return await updateStorageRates(currency.rates, TIME_KEY.TRY);
}

async function handleQueryARS() {
  const currencyData = await dispatchBackgroundEvent("queryARS");

  let currency = await getStoreValue("currency");
  if (baseCurrencykey === "USD") {
    currency.rates["ARS"] = parseFloat(currencyData["venta"]);
  }

  return await updateStorageRates(currency.rates, TIME_KEY.ARS);
}

async function handleQueryBaseCurrency() {
  const data = await dispatchBackgroundEvent("queryBaseCurrency", { country });

  const currencyObj = Object.values(data).find(
    (obj) => obj.data && obj.data.price_overview,
  );
  const currency = currencyObj
    ? currencyObj.data.price_overview.currency
    : null;

  return currency;
}
