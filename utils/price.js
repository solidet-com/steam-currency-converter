function updatePriceInLocalCurrency(item, rate) {
    if (item.getAttribute("data-ext-stats") == "converted") return;
    const originalUsdPriceText = item.textContent.trim().replace("$", "").trim();

    const originalUsdPrice = parseFloat(originalUsdPriceText);

    item.setAttribute("data-ext-converted", true);
    item.setAttribute("data-ext-price-mem", item.textContent.trim());

    if (!isNaN(originalUsdPrice)) {
        const originalTryPrice = convertToLocalCurrency(originalUsdPrice, rate);

        if (originalTryPrice !== null) {
            item.textContent = originalTryPrice;
        }
    }
}

function getItems(node, ...selectors) {
    return Array.from(node.querySelectorAll(selectors.join(",")));
}

function togglePrices() {
    const items = document.querySelectorAll("[data-ext-converted]");
    for (let item of items) {
        const originalPriceText = item.getAttribute("data-ext-price-mem");
        item.setAttribute("data-ext-converted", !item.getAttribute("data-ext-converted"));
        item.setAttribute("data-ext-price-mem", item.textContent.trim());
        item.textContent = `${originalPriceText}`;
    }
}
