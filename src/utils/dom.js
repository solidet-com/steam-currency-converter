function initItem(item, update = false) {
  if (baseCurrencyKey == targetCurrencyKey) {
    targetCurrencyRate = 1;
  }

  if (item.getAttribute("data-ext-converted") && !update) return;
  const textNode = getTextNodes(item)[0];

  let originalBasePriceText = textNode.textContent.trim();

  const currencyInformation = BASE_CURRENCIES.find(
    (currency) => currency.abbr === baseCurrencyKey
  );

  originalBasePriceText = originalBasePriceText.replace(
    currencyInformation?.format?.thousand,
    ""
  );
  if (currencyInformation?.format?.decimal !== ".") {
    originalBasePriceText = originalBasePriceText.replace(
      currencyInformation?.format?.decimal,
      "."
    );
  }

  const currencySymbol = allCurrencies[baseCurrencyKey];

  const escapedCurrencySymbol = escapeRegExp(currencySymbol);
  const escapedBaseCurrencyKey = escapeRegExp(baseCurrencyKey);

  const symbolAsPrefixRegex = `(?:${escapedCurrencySymbol}\\s*(-?\\d+[,.]?\\d*)\\s*(?:${escapedBaseCurrencyKey})?`;
  const symbolAsSuffixRegex = `(\\d+[,.]?\\d*)\\s*(?:${escapedBaseCurrencyKey})?\\s*${escapedCurrencySymbol})`;

  const regexPattern = new RegExp(
    `${symbolAsPrefixRegex}|${symbolAsSuffixRegex}`,
    "g"
  );

  let matches = originalBasePriceText.matchAll(regexPattern);
  for (const match of matches) {
    let originalBasePrice = parseFloat(match[1] || match[2]);
    let basePriceWithCurrency = match[0];

    item.setAttribute("data-ext-converted", false);
    let originalTargetPrice;
    let applyTax = true;

    if (TAX_IGNORED_SELECTORS.some((selector) => item.matches(selector))) {
      applyTax = false;
    }

    if (isNaN(originalBasePrice)) {
      originalTargetPrice = basePriceWithCurrency;
    } else {
      originalTargetPrice = convertToLocalCurrency(originalBasePrice, applyTax);
    }

    originalBasePriceText = originalBasePriceText.replace(
      basePriceWithCurrency,
      originalTargetPrice.toString()
    );
  }

  item.setAttribute("data-ext-price-mem", originalBasePriceText);
}

function getItems(node, ...selectors) {
  return Array.from(node.querySelectorAll(selectors.join(",")));
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
      all = all.concat(
        getTextNodes(child, { ...options, currLevel: currLevel + 1 })
      );
    }
  }

  if (!all.length && !options.returnEmpty) return [node];

  return all;
}

function togglePrice(item) {
  if (item.getAttribute("data-ext-converted") == `${converterActive}`) return;

  const originalPriceText = item.getAttribute("data-ext-price-mem");
  const priceTextNode = getTextNodes(item)[0];

  item.setAttribute("data-ext-converted", converterActive);
  item.setAttribute("data-ext-price-mem", priceTextNode.textContent.trim());

  priceTextNode.textContent = `${originalPriceText}`;
}

function togglePrices() {
  document.querySelectorAll("[data-ext-converted]").forEach(togglePrice);
}
