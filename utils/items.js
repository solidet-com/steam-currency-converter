function updatePriceInLocalCurrency(item, rate) {
  if (item.classList.contains("price-localized")) return;
  const originalUsdPriceText = item.textContent.trim().replace("$", "").trim();

  const originalUsdPrice = parseFloat(originalUsdPriceText);
  item.classList.add("price-localized");
  if (!isNaN(originalUsdPrice)) {
    const originalTryPrice = convertToLocalCurrency(originalUsdPrice, rate);

    if (originalTryPrice !== null) {
      console.log("changing price");
      console.log(originalUsdPrice);
      console.log("to");
      console.log(originalTryPrice);
      item.textContent = originalTryPrice;
    }
  }
}
function getItems(node, ...selectors) {
  return Array.from(node.querySelectorAll(selectors.join(",")));
}
