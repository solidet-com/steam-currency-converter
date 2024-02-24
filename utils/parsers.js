function getCurrencySymbolFromString(str) {
  const re =
    /(?:R\$|S\$|\$|RM|kr|Rp|€|¥|£|฿|pуб|P|₫|₩|TL|₺|TRY|PLN|₴|Mex\$|CDN\$|A\$|HK\$|NT\$|₹|SR|R |DH|CHF|CLP\$|S\/\.|COL\$|NZ\$|ARS\$|₡|₪|₸|KD|zł|QR|\$U)/;
  const match = str.match(re);
  console.log("from getCurrencySymbolFromString", match ? match[0] : "");
  return match ? match[0] : "";
}

function parseCurrencyFromText(text) {
  console.log("from parseCurrencyFromText", text);
  const symbol = getCurrencySymbolFromString(text);
  console.log(`Matched currency symbol as "${symbol}" from text`);
  return getCurrencyBySymbol(symbol);
}

function getCurrencyBySymbol(symbol) {
  if (!symbol) return;
  return BASE_CURRENCIES.find((currency) => currency.symbol === symbol).abbr;
}

function getUserCountry() {
  const script = document.evaluate(
    '//script[contains(text(), "EnableSearchSuggestions")]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (script) {
    const result = script.textContent.match(
      /EnableSearchSuggestions\(.+?'(?<cc>[A-Z]{2})',/
    );

    if (result) {
      country = result.groups.cc;

      logger(`Matched country as "${country}" from search script`);
    }
  }
  if (!country) {
    logger("Failed to detect store country. Trying community scripts");
    country = getCommunityCountry();
  }

  return country;
}

function getCommunityCountry() {
  const config = document.querySelector("#webui_config, #application_config");
  if (config) {
    country = JSON.parse(config.dataset.config).COUNTRY;
  } else if (window.location.hostname === "steamcommunity.com") {
    // This variable is present on market-related pages
    country = getVariableFromDom("g_strCountryCode", "string");
  } else {
    country = getVariableFromDom(
      /GDynamicStore\.Init\(.+?,\s*'([A-Z]{2})'/,
      "string"
    );
  }

  if (!country) {
    console.warn("Script with user store country not found");
  }
  logger(`Matched country as "${country}" from community script`);
  return country;
}

async function getStoreCurrency() {
  let currency;
  console.log("store currrency alıyorum");
  // Select the price currency meta tag
  let currencyElement = document.querySelector("#header_wallet_balance") || "";
  console.log("is it null at first?", !currencyElement);
  if (!currencyElement) {
    currency = await handleQueryBaseCurrency();
  } else {
    currency =
      currencyElement?.textContent &&
      parseCurrencyFromText(currencyElement?.textContent);
  }
  console.log("before forcing currency is", currency);
  if (!currency) {
    currency = "USD";

    console.log("Missing priceCurrency, forced to USD");
  }
  //
  return currency;
}

function getVariableFromText(text, name, type) {
  let regex;
  if (typeof name === "string") {
    if (type === "object") {
      regex = new RegExp(`${name}\\s*=\\s*(\\{.+?\\});`);
    } else if (type === "array") {
      regex = new RegExp(`${name}\\s*=\\s*(\\[.+?\\]);`);
    } else if (type === "int") {
      regex = new RegExp(`${name}\\s*=\\s*(.+?);`);
    } else if (type === "string") {
      regex = new RegExp(`${name}\\s*=\\s*['"](.+?)['"];`);
    }
  } else if (name instanceof RegExp) {
    regex = name;
  }

  const m = text.match(regex);
  if (m) {
    if (type === "int") {
      return parseInt(m[1]);
    } else if (type === "string") {
      return m[1];
    }

    try {
      return JSON.parse(m[1]);
    } catch {
      return null;
    }
  }

  return null;
}

function getVariableFromDom(name, type, dom = document) {
  for (const node of dom.querySelectorAll("script")) {
    const value = getVariableFromText(node.textContent, name, type);

    if (value !== null) {
      return value;
    }
  }

  return null;
}

function getCurrencyByCountryCode(countryCode) {
  let currency;
  let isDefaultValue;

  switch (countryCode) {
    // Euro (EUR) countries
    case "AT": // Austria
    case "BE": // Belgium
    case "CY": // Cyprus
    case "EE": // Estonia
    case "FI": // Finland
    case "FR": // France
    case "DE": // Germany
    case "GR": // Greece
    case "IE": // Ireland
    case "IT": // Italy
    case "LV": // Latvia
    case "LT": // Lithuania
    case "LU": // Luxembourg
    case "MT": // Malta
    case "NL": // Netherlands
    case "PT": // Portugal
    case "SK": // Slovakia
    case "SI": // Slovenia
    case "ES": // Spain
    case "MC": // Monaco
    case "SM": // San Marino
    case "VA": // Vatican City
    case "ME": // Montenegro
    case "AD": // Andorra
      currency = "EUR";
      break;
    // Danish Krone (DKK) countries
    case "DK": // Denmark
    case "FO": // Faroe Islands
    case "GL": // Greenland
      currency = "DKK";
      break;
    //iceland
    case "IS":
      currency = "ISK";
      break;
    // Swedish Krona (SEK) countries
    case "SE": // Sweden
      currency = "SEK";
      break;
    // USD countries
    case "US": // United States
    case "EC": // Ecuador
    case "SV": // El Salvador
    case "FM": // Federated States of Micronesia
    case "MH": // Marshall Islands
    case "PW": // Palau
    case "TL": // Timor-Leste
    case "ZW": // Zimbabwe
      currency = "USD";
      break;
    // Balkan countries
    case "RS": // Serbia
      currency = "RSD";
      break;
    case "JP": // Japan
      currency = "JPY";
      break;
    case "BA": // Bosnia and Herzegovina
      currency = "BAM";
      break;
    case "BG": // Bulgaria
      currency = "BGN";
      break;
    //romania
    case "RO":
      currency = "RON";
      break;
    //mexico
    case "MX":
      currency = "MXN";
      break;
    //canada
    case "CA":
      currency = "CAD";
      break;
    case "AU":
      currency = "AUD";
      break;

    case "AZ":
      currency = "AZN";
      break; // Azerbaijan
    case "AM":
      currency = "AMD";
      break; // Armenia
    case "BY":
      currency = "BYN";
      break; // Belarus
    case "GE":
      currency = "GEL";
      break; // Georgia
    case "KG":
      currency = "KGS";
      break; // Kyrgyzstan
    case "MD":
      currency = "MDL";
      break; // Moldova
    case "TJ":
      currency = "TJS";
      break; // Tajikistan
    case "TM":
      currency = "TMT";
      break; // Turkmenistan
    case "UZ":
      currency = "UZS";
      break; // Uzbekistan
    case "UA":
      currency = "UAH";
      break; // Ukraine

    case "BD":
      currency = "BDT";
      break; // Bangladesh
    case "BT":
      currency = "BTN";
      break; // Bhutan

    case "NP":
      currency = "NPR";
      break; // Nepal
    case "PK":
      currency = "PKR";
      break; // Pakistan
    case "LK":
      currency = "LKR";
      break; // Sri Lanka

    case "AR":
      currency = "ARS";
      break; // Argentina
    case "BO":
      currency = "BOB";
      break; // Bolivia
    case "BZ":
      currency = "BZD";
      break; // Belize
    case "GT":
      currency = "GTQ";
      break; // Guatemala
    case "GY":
      currency = "GYD";
      break; // Guyana
    case "HN":
      currency = "HNL";
      break; // Honduras
    case "NI":
      currency = "NIO";
      break; // Nicaragua
    case "PA":
      currency = "PAB";
      break; // Panama
    case "PY":
      currency = "PYG";
      break; // Paraguay
    case "SR":
      currency = "SRD";
      break; // Suriname

    case "BH":
      currency = "BHD";
      break; // Bahrain
    case "DZ":
      currency = "DZD";
      break; // Algeria
    case "EG":
      currency = "EGP";
      break; // Egypt
    case "IQ":
      currency = "IQD";
      break; // Iraq
    case "JO":
      currency = "JOD";
      break; // Jordan
    case "LB":
      currency = "LBP";
      break; // Lebanon
    case "LY":
      currency = "LYD";
      break; // Libya
    case "MA":
      currency = "MAD";
      break; // Morocco
    case "OM":
      currency = "OMR";
      break; // Oman
    case "PS":
      currency = "ILS";
      break; // Palestine
    case "PL":
      currency = "PLN";
      break; // Poland
    case "RU": // Russia
      currency = "RUB";
      break;
    case "UA": // Ukraine
      currency = "UAH";
      break;
    case "SD":
      currency = "SDG";
      break; // Sudan
    case "TN":
      currency = "TND";
      break; // Tunisia
    case "TR":
      currency = "TRY";
      break; // Turkey
    case "YE":
      currency = "YER";
      break; // Yemen
    default:
      currency = "TRY";
      isDefaultValue = true;
      break;
  }
  return [currency, isDefaultValue];
}
