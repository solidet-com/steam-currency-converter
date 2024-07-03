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

function numberWithCommas(x, { thousandSeparator, decimalSeparator }) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  return parts.join(decimalSeparator);
}
function logger(message) {
  console.log(
    `%c[Steam Currency Converter]: %c${message}`,
    "color: #00aaff; font-weight: bold;",
    "color: #f36f63;"
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
  const savedCountry = await getStoreValue("country");

  const loginStatus = isUserLoggedIn();
  if (
    savedLoginStatus != loginStatus ||
    savedCountry != country ||
    baseCurrencyKey == null
  ) {
    if (savedLoginStatus && savedLoginStatus != loginStatus)
      logger("Login Status has been changed, checking Steam Store Currency!");
    else if (savedCountry && savedCountry != country)
      logger("Country has been changed, checking Steam Store Currency!");

    setLoginStatus(loginStatus);
    baseCurrencyKey = await getStoreCurrency();
    const currencyData = await updateRatesALL({ baseCurrencyKey });
    targetCurrencyRate = currencyData.rates[targetCurrencyKey] || 1;
    await chrome.storage.local.set({ baseStoreCurrency: baseCurrencyKey });
  }
}
const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay));

function isIframe() {
  return window != window.top;
}

async function handleIframe(timeout = 0) {
  return new Promise(async (resolve, reject) => {
    let elapsedTime = 0;
    while (!(await isDataSet()) && elapsedTime < timeout) {
      await wait(500);
      elapsedTime += 500;
    }
    if (elapsedTime >= timeout) reject("IFrame script ran before data was initialized. Aborting IFrame conversion.");
    resolve();
  });
}

