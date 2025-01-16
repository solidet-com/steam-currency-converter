async function dispatchBackgroundEvent({ event, payload }) {
  const eventPromise = chrome.runtime.sendMessage({
    event,
    payload,
  });

  const data = await eventPromise;

  if (chrome.runtime.lastError) {
    console.error(`Error: ${chrome.runtime.lastError.message}`);
    return;
  }

  return data;
}

async function updateRatesALL(payload) {
  const currencyData = await dispatchBackgroundEvent({
    event: "get-currency:all",
    payload,
  });
  return await updateStorageRates(currencyData.rates, TIME_KEY.ALL);
}

async function updateRatesTRY() {
  const currencyData = await dispatchBackgroundEvent({
    event: "get-currency:try",
  });

  let currency = await getStoreValue("currency");

  if (currencyData[baseCurrencyKey]) {
    currency.rates["TRY"] = parseFloat(
      currencyData[baseCurrencyKey]["Selling"]
    );
  }

  return await updateStorageRates(currency.rates, TIME_KEY.TRY);
}

async function updateRatesARS() {
  const currencyData = await dispatchBackgroundEvent({
    event: "get-currency:ars",
  });

  let currency = await getStoreValue("currency");
  if (baseCurrencyKey === "USD") {
    currency.rates["ARS"] = parseFloat(currencyData["venta"]);
  }

  return await updateStorageRates(currency.rates, TIME_KEY.ARS);
}

async function getBaseCurrencyBySteamGame() {
  const data = await dispatchBackgroundEvent({
    event: "fetch:steam-game",
    payload: { country },
  });

  const currencyObj = Object.values(data).find(
    (obj) => obj.data && obj.data.price_overview
  );
  const currency = currencyObj
    ? currencyObj.data.price_overview.currency
    : null;

  return currency;
}
