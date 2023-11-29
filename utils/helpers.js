function convertToLocalCurrency(basePrice, applyTax = true) {
    if (currencyRate) {
        let targetPrice = basePrice * currencyRate;
        if (tax > 0 && applyTax) targetPrice += targetPrice * (tax / 100);
        return currencySymbolMap[currencyKey] + numberWithCommas(targetPrice.toFixed(2));
    } else {
        console.error("Exchange rates not available.");
        return null;
    }
}

async function handleQueryCommonHead(query) {
    const currencyDataPromise = chrome.runtime.sendMessage({
        contentScriptQuery: query,
    });

    const currencyData = await currencyDataPromise;

    if (chrome.runtime.lastError) {
        console.error(`Error: ${chrome.runtime.lastError.message}`);
        return;
    }

    return currencyData;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function handleQueryCommonTail(rates, updateKey) {
    const lastCurrencyPayload = {
        currency: {
            rates: rates,
        },
    };

    const lastTimePayload = {
        [getUpdateDateKey(updateKey)]: new Date().getTime(),
    };

    await chrome.storage.local.set(lastCurrencyPayload);
    await chrome.storage.local.set(lastTimePayload);

    return lastCurrencyPayload;
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
        if (child.nodeType == Node.TEXT_NODE) all.push(child);
        else if (currLevel < level) all = all.concat(getTextNodes(child, { ...options, currLevel: currLevel + 1 }));
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

function getCurrencyByCountryCode(countryCode) {
    let currency;
    switch (countryCode) {
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
    return currency;
}

function logger(message) {
    console.log(`%c[Steam Currency Converter]: %c${message}`, "color: #00aaff; font-weight: bold;", "color: #fff;");
}
