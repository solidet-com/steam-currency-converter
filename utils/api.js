async function handleQueryAll() {
  const currencyData = await handleQueryCommonHead("queryCurrency");
  console.log("dönen data")
  console.log(currencyData)
  return await handleQueryCommonTail(currencyData.rates, TIME_KEY.ALL);
}

async function handleQueryTRY() {
  const currencyData = await handleQueryCommonHead("queryTRY");
  let { currency } = await chrome.storage.local.get(["currency"]);
console.log("before",  currency.rates["TRY"] )
  currency.rates["TRY"] = parseFloat(currencyData[baseCurrency]["Selling"]);
console.log("affter",  currency.rates["TRY"])
  return await handleQueryCommonTail(currency.rates, TIME_KEY.TRY);
}

async function handleQueryARS() {
  const currencyData = await handleQueryCommonHead("queryARS");
  let { currency } = await chrome.storage.local.get(["currency"]);
  currency.rates["ARS"] = parseFloat(currencyData["venta"]);
  return await handleQueryCommonTail(currency.rates, TIME_KEY.ARS);
}
