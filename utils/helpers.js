async function getStoreValue(key) {
    const value = await chrome.storage.local.get([key]);
    return value[key];
}

function convertToLocalCurrency(basePrice, applyTax = true) {
    if (targetCurrencyRate) {
        const currencyFormat = getCurrencyFormat(targetCurrencyKey);
        let targetPrice = basePrice * targetCurrencyRate;
        if (tax > 0 && applyTax) targetPrice += targetPrice * (tax / 100);

        const symbol = currencyFormat?.symbolFormat || allCurrencies[targetCurrencyKey];

        let modifiedNumber = numberWithCommas(targetPrice.toFixed(currencyFormat.places));
        if (currencyFormat?.right) {
            return modifiedNumber + symbol;
        }

        return symbol + modifiedNumber;
    } else {
        console.error("Exchange rates not available.");
        return null;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function updateStorageRates(rates, updateKey) {
    const lastCurrencyPayload = {
        currency: {
            rates: rates,
        },
    };
    console.log("lastCurrencyPayload", lastCurrencyPayload);
    const lastTimePayload = {
        [getUpdateDateKey(updateKey)]: new Date().getTime(),
    };

    await chrome.storage.local.set(lastCurrencyPayload);
    await chrome.storage.local.set(lastTimePayload);

    return lastCurrencyPayload?.currency;
}

function getUpdateDateKey(updateKey) {
    return `update${updateKey}Date`;
}

async function updateItems(storedConverter) {
    if (storedConverter) {
        await chrome.storage.local.set({ converterActive: false });
    }
    initItems(true);
    if (storedConverter) {
        await chrome.storage.local.set({ converterActive: true });
    }
}

function getTextNodes(
    node,
    options = {
        level: 1,
        currLevel: 1,
        returnEmpty: false,
    }
) {
    let all = [];
    const { level, currLevel } = options;
    for (let child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == Node.TEXT_NODE) {
            all.push(child);
        } else if (currLevel < level) {
            all = all.concat(getTextNodes(child, { ...options, currLevel: currLevel + 1 }));
        }
    }

    if (!all.length && !options.returnEmpty) return [node];

    return all;
}

function getSearchScriptCountry() {
    const script = document.evaluate(
        '//script[contains(text(), "EnableSearchSuggestions")]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    let country = null;

    if (script) {
        const result = script.textContent.match(/EnableSearchSuggestions\(.+?'(?<cc>[A-Z]{2})',/);

        if (result) {
            country = result.groups.cc;

            logger(`Matched country as "${country}" from search script`);

            // console.log(
            //     `%cSteam Currency Converter matched country as "%c${country}%c" from search script`,
            //     "color: green; font-weight: bold;",
            //     "color: gray-smoke; font-weight: bold;",
            //     "color: green; font-weight: bold;"
            // );
        } else {
            console.log(
                "%cSteam Currency Converter failed to find country in search script",
                "color: red; font-weight: bold;"
            );
        }
    }

    return country;
}

function getStoreCurrency() {
    console.log("store currrency alıyorum");
    // Select the price currency meta tag
    let currencyElement = document.querySelector("#header_wallet_balance") || "";
    console.log("is it null at first?", !currencyElement);
    if (!currencyElement) {
        if (window.location.href.includes("store.steampowered.com/")) {
            console.log("store'a girdim");
            currencyElement = document.querySelector(".discount_original_price");
            console.log("currencyElement is", currencyElement);
        } else if (window.location.href.includes("steamcommunity.com/market/")) {
            console.log("markete girdim");
            currencyElement = document.querySelector(".normal_price");
        } else {
            console.log("Not in Steam store.");
        }
    }
    let currency = currencyElement?.textContent && parseCurrencyFromText(currencyElement?.textContent);

    console.log("before forcing currency is", currency);
    if (!currency) {
        currency = "USD";

        console.log("Missing priceCurrency, forced to USD");
    }
    //
    // TODO:
    //burda kod tekrarı var, target currency seçerkenki fonksiyon yine çalışıyor
    //temizle

    if (currency === "USD") {
        const country = getSearchScriptCountry();

        // Map countries that use USD but different pricing region to their own unique currency name
        // This is done here to not send user's country to the server and to increase cache hits
        // See https://partner.steamgames.com/doc/store/pricing/currencies
        switch (country) {
            case "AZ": // Azerbaijan
            case "AM": // Armenia
            case "BY": // Belarus
            case "GE": // Georgia
            case "KG": // Kyrgyzstan
            case "MD": // Moldova
            case "TJ": // Tajikistan
            case "TM": // Turkmenistan
            case "UZ": // Uzbekistan
            case "BD": // Bangladesh
            case "BT": // Bhutan
            case "NP": // Nepal
            case "PK": // Pakistan
            case "LK": // Sri Lanka
            case "AR": // Argentina
            case "BO": // Bolivia
            case "BZ": // Belize
            case "EC": // Ecuador
            case "GT": // Guatemala
            case "GY": // Guyana
            case "HN": // Honduras
            case "NI": // Nicaragua
            case "PA": // Panama
            case "PY": // Paraguay
            case "SR": // Suriname
            case "SV": // El Salvador
            case "VE": // Venezuela
            case "BH": // Bahrain
            case "DZ": // Algeria
            case "EG": // Egypt
            case "IQ": // Iraq
            case "JO": // Jordan
            case "LB": // Lebanon
            case "LY": // Libya
            case "MA": // Morocco
            case "OM": // Oman
            case "PS": // Palestine
            case "SD": // Sudan
            case "TN": // Tunisia
            case "TR": // Turkey
            case "YE": // Yemen
                currency = "USD";
                break;
        }
    }
    return currency;
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

function getCurrencyBySymbol(symbol) {
    if (!symbol) return;
    return BASE_CURRENCIES.find((currency) => currency.symbol === symbol).abbr;
}

function getCurrencyFormat(currencyKey) {
    const defaultFormat = {
        places: 2,
        hidePlacesWhenZero: false,
        symbolFormat: null,
        thousand: ",",
        decimal: ".",
        right: false,
    };

    const currency = CURRENCY_INFORMATIONS.find((currency) => currency.abbr === currencyKey);

    return currency?.format || defaultFormat;
}

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

function logger(message) {
    console.log(`%c[Steam Currency Converter]: %c${message}`, "color: #00aaff; font-weight: bold;", "color: #fff;");
}

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
