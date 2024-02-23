function getCurrencyFormat(currencyKey) {
  const defaultFormat = {
    places: 2,
    hidePlacesWhenZero: false,
    symbolFormat: null,
    thousand: ",",
    decimal: ".",
    right: false,
  };

  const currency = CURRENCY_INFORMATIONS.find(
    (currency) => currency.abbr === currencyKey
  );

  return currency?.format || defaultFormat;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function logger(message) {
  console.log(
    `%c[Steam Currency Converter]: %c${message}`,
    "color: #00aaff; font-weight: bold;",
    "color: #fff;"
  );
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
