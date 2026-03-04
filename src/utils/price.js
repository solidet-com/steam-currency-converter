function convertToLocalCurrency(basePrice, applyTax = true) {
  if (Number.isFinite(targetCurrencyRate) && targetCurrencyRate > 0) {
    const currencyFormat = getCurrencyFormat(targetCurrencyKey);
    let targetPrice = basePrice * targetCurrencyRate;
    if (tax > 0 && applyTax) targetPrice += targetPrice * (tax / 100);

    const symbol =
      currencyFormat?.symbolFormat || allCurrencies[targetCurrencyKey] || targetCurrencyKey + " ";
    const places = currencyFormat?.places ?? 2;

    let modifiedNumber = numberWithCommas(
      targetPrice.toFixed(places),
      {
        thousandSeparator: currencyFormat.thousand,
        decimalSeparator: currencyFormat.decimal,
      }
    );
    let result;
    if (currencyFormat?.right) {
      result = modifiedNumber + symbol;
    } else {
      result = symbol + modifiedNumber;
    }
    if (currencyFormat?.suffix) {
      result += currencyFormat.suffix;
    }
    return result;
  } else {
    console.error("Exchange rates not available.");
    return null;
  }
}

function getCurrencyBySymbol(symbol) {
  if (!symbol) return;
  return BASE_CURRENCIES.find((currency) => currency.symbol === symbol).abbr;
}
