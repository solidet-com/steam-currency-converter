function initItem(item, update = false) {
  if (item.getAttribute("data-ext-converted") && !update) return;
  const textNode = getTextNodes(item)[0];

  let originalBasePriceText = textNode.textContent.trim();
  let matches = originalBasePriceText.matchAll(/\$(-?\d+\.?\d+)(\s?USD)?/g);

  for (const match of matches) {
    let originalBasePrice = parseFloat(match[1]);
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
