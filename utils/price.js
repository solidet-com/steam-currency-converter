function initItem(item, rate) {
    if (item.getAttribute("data-ext-converted")) return;
  
    const originalBasePriceText = item.textContent.trim();
    const originalBasePrice = parseFloat(
      /(\d+\.?\d*)/.exec(originalBasePriceText)?.[0]
    );
    item.setAttribute("data-ext-converted", false);
    
    let originalTargetPrice;
    if (isNaN(originalBasePrice)) originalTargetPrice = originalBasePriceText;
    else originalTargetPrice = convertToLocalCurrency(originalBasePrice, rate);
    
    item.setAttribute("data-ext-price-mem", originalTargetPrice);
  }

function getItems(node, ...selectors) {
  return Array.from(node.querySelectorAll(selectors.join(",")));
}

function togglePrices() {
  const items = document.querySelectorAll("[data-ext-converted]");
  for (let item of items) {
    const originalPriceText = item.getAttribute("data-ext-price-mem");
    item.setAttribute(
      "data-ext-converted",
      !item.getAttribute("data-ext-converted")
    );
    item.setAttribute("data-ext-price-mem", item.textContent.trim());
    item.textContent = `${originalPriceText}`;
  }
}

function togglePrice(item) {
  const originalPriceText = item.getAttribute("data-ext-price-mem");
  item.setAttribute(
    "data-ext-converted",
    !item.getAttribute("data-ext-converted")
  );
  item.setAttribute("data-ext-price-mem", item.textContent.trim());
  item.textContent = `${originalPriceText}`;
}
