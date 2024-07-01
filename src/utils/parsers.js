function getCurrencySymbolFromString(str) {
  const re =
    /(?:R\$|S\$|\$|RM|kr|Rp|€|¥|£|฿|pуб|P|₫|₩|TL|₺|TRY|PLN|₴|Mex\$|CDN\$|A\$|HK\$|NT\$|₹|SR|R |DH|CHF|CLP\$|S\/\.|COL\$|NZ\$|ARS\$|₡|₪|₸|KD|zł|QR|\$U)/;
  const match = str.match(re);
  return match ? match[0] : "";
}

function parseCurrencyFromText(text) {
  const symbol = getCurrencySymbolFromString(text);
  return getCurrencyBySymbol(symbol);
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
  // Select the price currency meta tag
  let currencyElement = document.querySelector("#header_wallet_balance") || "";
  if (!currencyElement) {
    currency = await getBaseCurrencyBySteamGame();
  } else {
    currency =
      currencyElement?.textContent &&
      parseCurrencyFromText(currencyElement?.textContent);
  }
  if (!currency) {
    currency = "USD";

    logger("Missing priceCurrency, forced to USD");
  }
  //
  return currency;
}

function isUserLoggedIn() {
  return document.querySelector("#account_dropdown") ? true : false;
}

function setLoginStatus(loginStatus) {
  chrome.storage.local.set({ loginStatus: loginStatus });
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
  let currencyKey;
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
      currencyKey = "EUR";
      break;
    case "HU":
      currencyKey = "HUF";
      break; // Hungary
    case "HR":
      currencyKey = "HRK";
      break; // Croatia
    case "CZ":
      currencyKey = "CZK";
      break; // Czech Republic
    // Danish Krone (DKK) countries
    case "DK": // Denmark
    case "FO": // Faroe Islands
    case "GL": // Greenland
      currencyKey = "DKK";
      break;
    //iceland
    case "IS":
      currencyKey = "ISK";
      break;
    // Swedish Krona (SEK) countries
    case "SE": // Sweden
      currencyKey = "SEK";
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
      currencyKey = "USD";
      break;
    // Balkan countries
    case "RS": // Serbia
      currencyKey = "RSD";
      break;
    case "CH":
      currencyKey = "CHF";
      break; // Switzerland
    case "JP": // Japan
      currencyKey = "JPY";
      break;
    case "BA": // Bosnia and Herzegovina
      currencyKey = "BAM";
      break;
    case "BG": // Bulgaria
      currencyKey = "BGN";
      break;
    //romania
    case "RO":
      currencyKey = "RON";
      break;
    //mexico
    case "MX":
      currencyKey = "MXN";
      break;
    //canada
    case "CA":
      currencyKey = "CAD";
      break;
    case "AU":
      currencyKey = "AUD";
      break;
    case "NZ":
      currencyKey = "NZD";
      break;
    case "NOR":
      currencyKey = "NOK";
      break; //norway
    case "AZ":
      currencyKey = "AZN";
      break; // Azerbaijan
    case "AM":
      currencyKey = "AMD";
      break; // Armenia
    case "BY":
      currencyKey = "BYN";
      break; // Belarus
    case "GE":
      currencyKey = "GEL";
      break; // Georgia
    case "KG":
      currencyKey = "KGS";
      break; // Kyrgyzstan
    case "KZ":
      currencyKey = "KZT";
      break; // Kazakhstan
    case "KW":
      currencyKey = "KWD";
      break; // Kuwait
    case "QA":
      currencyKey = "QAR";
      break; // Qatar
    case "MD":
      currencyKey = "MDL";
      break; // Moldova
    case "TJ":
      currencyKey = "TJS";
      break; // Tajikistan
    case "TM":
      currencyKey = "TMT";
      break; // Turkmenistan
    case "UZ":
      currencyKey = "UZS";
      break; // Uzbekistan
    case "BY":
      currencyKey = "BYN";
      break; // Belarus

    case "UA":
      currencyKey = "UAH";
      break; // Ukraine
    case "UK":
      currencyKey = "GBP";
      break; // UNITED KINGDOM
    case "BD":
      currencyKey = "BDT";
      break; // Bangladesh
    case "BT":
      currencyKey = "BTN";
      break; // Bhutan
    case "ID":
      currencyKey = "IDR";
      break; // Indonesia
    case "IN":
      currencyKey = "INR";
      break; // India
    case "MY":
      currencyKey = "MYR";
      break; // Malaysia
    case "PH":
      currencyKey = "PHP";
      break; // Philippiness
    case "NP":
      currencyKey = "NPR";
      break; // Nepal
    case "PK":
      currencyKey = "PKR";
      break; // Pakistan
    case "LK":
      currencyKey = "LKR";
      break; // Sri Lanka
    case "CL":
      currencyKey = "CLP";
      break; // Chile
    case "SG":
      currencyKey = "SGD";
      break; // Singapore
    case "TH":
      currencyKey = "THB";
      break; // Thailand
    case "TW":
      currencyKey = "TWD";
      break; // Taiwan
    case "VN":
      currencyKey = "VND";
      break; // Vietnam
    case "KR":
      currencyKey = "KRW";
      break; // South Korea
    case "HK":
      currencyKey = "HKD";
      break; // Hong Kong

    case "AR":
      currencyKey = "ARS";
      break; // Argentina
    case "BO":
      currencyKey = "BOB";
      break; // Bolivia
    case "BZ":
      currencyKey = "BZD";
      break; // Belize
    case "GT":
      currencyKey = "GTQ";
      break; // Guatemala
    case "GY":
      currencyKey = "GYD";
      break; // Guyana
    case "HN":
      currencyKey = "HNL";
      break; // Honduras
    case "NI":
      currencyKey = "NIO";
      break; // Nicaragua
    case "PA":
      currencyKey = "PAB";
      break; // Panama
    case "PY":
      currencyKey = "PYG";
      break; // Paraguay
    case "SR":
      currencyKey = "SRD";
      break; // Suriname
    case "PE":
      currencyKey = "PEN";
      break; // Peru
    case "UY":
      currencyKey = "UYU";
      break; // Uruguay
    case "CO":
      currencyKey = "COP";
      break; // Colombia
    case "CR":
      currencyKey = "CRC";
      break; // Costa Rica
    case "ZA":
      currencyKey = "ZAR";
      break; // South Africa
    case "BH":
      currencyKey = "BHD";
      break; // Bahrain
    case "BR":
      currencyKey = "BRL";
      break; // Brazil
    case "DZ":
      currencyKey = "DZD";
      break; // Algeria
    case "EG":
      currencyKey = "EGP";
      break; // Egypt
    case "IQ":
      currencyKey = "IQD";
      break; // Iraq
    case "JO":
      currencyKey = "JOD";
      break; // Jordan
    case "LB":
      currencyKey = "LBP";
      break; // Lebanon
    case "LY":
      currencyKey = "LYD";
      break; // Libya
    case "MA":
      currencyKey = "MAD";
      break; // Morocco
    case "OM":
      currencyKey = "OMR";
      break; // Oman
    case "PS":
      currencyKey = "ILS";
      break; // Palestine
    case "PL":
      currencyKey = "PLN";
      break; // Poland
    case "RU": // Russia
      currencyKey = "RUB";
      break;
    case "SD":
      currencyKey = "SDG";
      break; // Sudan
    case "TN":
      currencyKey = "TND";
      break; // Tunisia
    case "TR":
      currencyKey = "TRY";
      break; // Turkey
    case "YE":
      currencyKey = "YER";
      break; // Yemen
    case "SA":
      currencyKey = "SAR";
      break; // Saudi Arabia
    case "AE":
      currencyKey = "AED";
      break; // United Arab Emirates
    default:
      currencyKey = "TRY";
      isDefaultValue = true;
      break;
  }
  return [currencyKey, isDefaultValue];
}

