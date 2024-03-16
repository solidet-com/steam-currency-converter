function convertToLocalCurrency(basePrice, applyTax = true) {
  if (targetCurrencyRate) {
    const currencyFormat = getCurrencyFormat(targetCurrencyKey);
    let targetPrice = basePrice * targetCurrencyRate;
    if (tax > 0 && applyTax) targetPrice += targetPrice * (tax / 100);

    const symbol =
      currencyFormat?.symbolFormat || allCurrencies[targetCurrencyKey];
      
    let modifiedNumber = numberWithCommas(
      targetPrice.toFixed(currencyFormat.places),{
        thousandSeparator: currencyFormat.thousand,
        decimalSeparator: currencyFormat.decimal
      }
    );
    if (currencyFormat?.right) {
      return modifiedNumber + symbol;
    }

    return symbol + modifiedNumber;
  } else {
    console.error("Exchange rates not available.");
    return null;
  }
}

function getCurrencyBySymbol(symbol) {
  if (!symbol) return;
  return BASE_CURRENCIES.find((currency) => currency.symbol === symbol).abbr;
}
