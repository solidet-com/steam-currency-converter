function initScript() {
  initItems();
  startObservers();
}

function initItems(onCurrencyChange = false) {
  let newItems = getItems(document, ...COMMON_SELECTORS);
  if (newItems?.length > 0) {
    newItems.forEach((item) => {
      initItem(item, onCurrencyChange);
      togglePrice(item);
    });
  }
}

async function initStorage() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  if (toggleStatus?.converterActive == null) {
    await chrome.storage.local.set({ converterActive: true });
  }
}

async function initCurrency() {
  {
    // We only need to know the country if currency is USD
    // as all other currencies are uniquely mapped already
    const script = document.evaluate(
      '//script[contains(text(), "EnableSearchSuggestions")]',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    let country = null;

    if (script) {
      const result = script.textContent.match(
        /EnableSearchSuggestions\(.+?'(?<cc>[A-Z]{2})',/
      );

      if (result) {
        country = result.groups.cc;

        console.log(
          `%cSteam Currency Converter matched country as "%c${country}%c" from search script`,
          "color: green; font-weight: bold;",
          "color: gray-smoke; font-weight: bold;",
          "color: green; font-weight: bold;"
        );
      } else {
        console.log(
          "%cSteam Currency Converter failed to find country in search script",
          "color: red; font-weight: bold;"
        );
      }
    }

    switch (country) {
      case "AZ":
        currency = "AZN";
        break;
      // Azerbaijan
      case "AM":
        currency = "AMD";
        break;
      case "BY": // Belarus
        currency = "BYN";
        break;
      case "GE": // Georgia
        currency = "GEL";
        break;
      case "KG": // Kyrgyzstan
        currency = "KGS";
        break;
      case "MD": // Moldova
        currency = "MDL";
        break;
      case "TJ": // Tajikistan
        currency = "TJS";
        break;
      case "TM": // Turkmenistan
        currency = "TMT";
        break;
      case "UZ": // Uzbekistan
        currency = "UZS";
        break;
      case "UA":
        currency = "UAH";
        break;

      case "BD":
        currency = "BDT";
        break;
      case "BT":
        currency = "BTN";
        break;

      case "NP":
        currency = "NPR";
        break;
      // Nepal
      case "PK":
        currency = "PKR";
        break;
      // Pakistan
      case "LK": // Sri Lanka
        currency = "LKR";
        break;

      case "AR": // Argentina
        currency = "ARS";
        break;
      case "BO": // Bolivia
        currency = "BOB";
        break;
      case "BZ": // Belize
        currency = "BZD";
        break;
      case "GT": // Guatemala
        currency = "GTQ";
        break;
      case "GY": // Guyana
        currency = "GYD";
        break;
      case "HN": // Honduras
        currency = "HNL";
        break;
      case "NI": // Nicaragua
        currency = "NIO";
        break;
      case "PA": // Panama
        currency = "PAB";
        break;
      case "PY": // Paraguay
        currency = "PYG";
        break;
      case "SR": // Suriname
        currency = "SRD";
        break;

      case "BH": // Bahrain
        currency = "BHD";
        break;
      case "DZ": // Algeria
        currency = "DZD";
        break;
      case "EG": // Egypt
        currency = "EGP";
        break;
      case "IQ": // Iraq
        currency = "IQD";
        break;
      case "JO": // Jordan
        currency = "JOD";
        break;
      case "LB": // Lebanon
        currency = "LBP";
        break;
      case "LY": // Libya
        currency = "LYD";
        break;
      case "MA": // Morocco
        currency = "MAD";
        break;
      case "OM": // Oman
        currency = "OMR";
        break;
      case "PS": // Palestine
        currency = "ILS";
        break;
      case "SD": // Sudan
        currency = "SDG";
        break;
      case "TN": // Tunisia
        currency = "TND";
        break;
      case "TR": // Turkey
        currency = "TRY";
        break;
      case "YE": // Yemen
        currency = "YER";
        break;
      default:
        currency = "TRY";
        break;
    }
    const savedCurrency = await chrome.storage.local.get("targetCurrency");
    if (!savedCurrency.targetCurrency)
      chrome.storage.local.set({ targetCurrency: currency });
  }
}

async function prepareData() {
  const toggleStatus = await chrome.storage.local.get(["converterActive"]);
  converterActive = toggleStatus.converterActive;

  let storedData = await chrome.storage.local.get(["currency"]);
  let { taxValue } = await chrome.storage.local.get(["taxValue"]);
  let { targetCurrency } = await chrome.storage.local.get(["targetCurrency"]);

  for (const interval of INTERVALS) {
    const timeStorageKey = getUpdateDateKey(interval.timeKey);
    let updatedDate = await chrome.storage.local.get([timeStorageKey]);

    const lastRefresh = updatedDate[timeStorageKey];
    const isInitial = lastRefresh == null;
    const diff = new Date().getTime() - lastRefresh;

    if (isInitial || diff > interval.value) {
      storedData = await interval.callback();
      if (interval?.afterCallback) {
        storedData = await interval.afterCallback();
      }
    }
  }
  currencyRate = storedData.currency.rates[targetCurrency];
  currencyKey = targetCurrency;
  tax = taxValue;
}

initCurrency().then(initStorage).then(prepareData).then(initScript);
