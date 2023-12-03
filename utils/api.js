async function handleQueryAll() {
  const currencyData = await handleQueryCommonHead("queryCurrency");

  return await handleQueryCommonTail(currencyData.rates, TIME_KEY.ALL);
}

async function handleQueryTRY() {
  const currencyData = await handleQueryCommonHead("queryTRY");
  let { currency } = await chrome.storage.local.get(["currency"]);

  currency.rates["TRY"] = parseFloat(currencyData["USD"]["Selling"]);

  return await handleQueryCommonTail(currency.rates, TIME_KEY.TRY);
}

async function handleQueryARS() {
  const currencyData = await handleQueryCommonHead("queryARS");
  let { currency } = await chrome.storage.local.get(["currency"]);
  currency.rates["ARS"] = parseFloat(currencyData["venta"]);
  return await handleQueryCommonTail(currency.rates, TIME_KEY.ARS);
}
