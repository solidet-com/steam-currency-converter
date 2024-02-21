function initItem(item, update = false) {
  if(baseCurrency==currencyKey) {
    currencyRate = 1;
  }

  if (item.getAttribute("data-ext-converted") && !update) return;
  const textNode = getTextNodes(item)[0];

  let originalBasePriceText = textNode.textContent.trim();

  const currencySymbol = allCurrencies[baseCurrency];

  const regexPattern = new RegExp(
    `(?:\\${currencySymbol}\\s*(-?\\d+[,.]?\\d*)\\s*(?:${baseCurrency})?|(\\d+[,.]?\\d*)\\s*(?:${baseCurrency})?\\s*\\${currencySymbol})`,
    "g"
);



  console.log(regexPattern)
  

  let matches = originalBasePriceText.matchAll(regexPattern);
  for (const match of matches) {
    let originalBasePrice = parseFloat(match[1]||match[2]);
    let basePriceWithCurrency = match[0];

    
    console.log(match)
    console.log("basePriceWithCurrency",basePriceWithCurrency)
    console.log("originalBasePrice",originalBasePrice)
    

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

function togglePrices() {
  document.querySelectorAll("[data-ext-converted]").forEach(togglePrice);
}

function togglePrice(item) {
  if (item.getAttribute("data-ext-converted") == `${converterActive}`) return;

  const originalPriceText = item.getAttribute("data-ext-price-mem");
  const priceTextNode = getTextNodes(item)[0];

  item.setAttribute("data-ext-converted", converterActive);
  item.setAttribute("data-ext-price-mem", priceTextNode.textContent.trim());

  priceTextNode.textContent = `${originalPriceText}`;
}
