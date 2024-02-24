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

function getManifest() {
  const manifest = chrome.runtime.getManifest();
  return manifest;
}

async function handleBaseCurrencyKey() {
  const savedLoginStatus = await getStoreValue("loginStatus");
  const loginStatus = isUserLoggedIn();
  if (savedLoginStatus != loginStatus || baseCurrencykey == null) {
    if (savedLoginStatus != loginStatus)
      logger("Login Status has been changed, checking Steam Store Currency!");
    setLoginStatus(loginStatus);
    baseCurrencykey = await getStoreCurrency();

    await chrome.storage.local.set({ baseStoreCurrency: baseCurrencykey });
  }
}
