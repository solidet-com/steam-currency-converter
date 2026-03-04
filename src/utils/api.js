function dispatchPageEvent(event, payload) {
  window.dispatchEvent(
    new CustomEvent("steamcc-to-page", getDispatchPayload(event, payload))
  );
}

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
  try {
    const currencyData = await dispatchBackgroundEvent({
      event: "get-currency:all",
      payload,
    });

    if (!currencyData || currencyData.error || !currencyData.rates) {
      logger("Failed to fetch currency rates from all sources, using cached data");
      const cached = await getStoreValue("currency");
      return cached || null;
    }

    return await updateStorageRates(currencyData.rates, TIME_KEY.ALL);
  } catch (error) {
    logger(`updateRatesALL error: ${error?.message}`);
    const cached = await getStoreValue("currency");
    return cached || null;
  }
}

async function updateRatesTRY() {
  try {
    const currencyData = await dispatchBackgroundEvent({
      event: "get-currency:try",
    });

    if (!currencyData || currencyData.error || !currencyData[baseCurrencyKey]) {
      logger("TRY rate update failed, skipping (covered by ALL endpoint)");
      return null;
    }

    let currency = await getStoreValue("currency");

    if (currencyData[baseCurrencyKey]) {
      currency.rates["TRY"] = parseFloat(
        currencyData[baseCurrencyKey]["Selling"]
      );
    }

    return await updateStorageRates(currency.rates, TIME_KEY.TRY);
  } catch (error) {
    logger(`TRY rate update error: ${error?.message}, skipping`);
    return null;
  }
}

async function updateRatesARS() {
  try {
    const currencyData = await dispatchBackgroundEvent({
      event: "get-currency:ars",
    });

    if (!currencyData || currencyData.error) {
      logger("ARS rate update failed, skipping (covered by ALL endpoint)");
      return null;
    }

    let currency = await getStoreValue("currency");
    if (baseCurrencyKey === "USD") {
      currency.rates["ARS"] = parseFloat(currencyData["venta"]);
    }

    return await updateStorageRates(currency.rates, TIME_KEY.ARS);
  } catch (error) {
    logger(`ARS rate update error: ${error?.message}, skipping`);
    return null;
  }
}

async function getBaseCurrencyBySteamGame() {
  try {
    const data = await dispatchBackgroundEvent({
      event: "fetch:steam-game",
      payload: { country },
    });

    if (!data || data.error) return null;

    const currencyObj = Object.values(data).find(
      (obj) => obj.data && obj.data.price_overview
    );
    const currency = currencyObj
      ? currencyObj.data.price_overview.currency
      : null;

    return currency;
  } catch (error) {
    logger(`getBaseCurrencyBySteamGame error: ${error?.message}`);
    return null;
  }
}
