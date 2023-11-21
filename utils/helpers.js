function convertToLocalCurrency(basePrice) {
  if (exchangeRatePromise) {
    const tryPrice = basePrice * exchangeRatePromise;
    return tryPrice.toFixed(2) + " ₺";
  } else {
    console.error("Exchange rates not available.");
    return null;
  }
}
