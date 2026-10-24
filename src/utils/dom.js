function initItem(item, update = false) {
  if (baseCurrencyKey == targetCurrencyKey) {
    targetCurrencyRate = 1;
  }

  if (item.getAttribute("data-ext-converted") && !update) return;
  const textNode = getPriceTextNode(item);
  if (!textNode) return;

  const originalText = textNode.nodeValue.trim();
  const convertedText = convertPriceText(originalText, !isTaxIgnored(item));
  if (convertedText == null) {
    // The page reused a converted element for text without a price (e.g.
    // "Free"), so its remembered price must not be restored later.
    if (update && !isOwnPriceWrite(item)) {
      item.removeAttribute("data-ext-converted");
      item.removeAttribute("data-ext-price-mem");
    }
    return;
  }

  // Store the final state right away instead of an intermediate one that
  // togglePrice would flip, it halves the DOM writes per price.
  if (converterActive === false) {
    item.setAttribute("data-ext-converted", false);
    item.setAttribute("data-ext-price-mem", convertedText);
  } else {
    item.setAttribute("data-ext-converted", converterActive);
    item.setAttribute("data-ext-price-mem", originalText);
    writePriceText(item, textNode, convertedText);
  }
}

// Converts every store currency price in the text and keeps the rest of it
// (labels, spacing) as is. Returns null when the text has no price.
function convertPriceText(text, applyTax) {
  const { prices } = getPriceRegexes();
  if (!prices) return null;

  let found = false;
  const converted = text.replace(prices, (match, prefixed, suffixed) => {
    found = true;
    const amount = parsePriceAmount(prefixed ?? suffixed);
    if (isNaN(amount)) return match;
    return convertToLocalCurrency(amount, applyTax) ?? match;
  });
  return found ? converted : null;
}

// "1.299,99" -> 1299.99, "17 999,00" -> 17999, "19,--" -> 19,
// "990.000" -> 990000. Steam always shows 3 digits after a thousands
// separator and at most 2 decimals, so the separator characters don't
// have to be known (they differ between Steam's pages and its API).
function parsePriceAmount(number) {
  const decimal = number.match(/[.,](\d{1,2}|--?)$/);
  const integer = decimal ? number.slice(0, decimal.index) : number;
  const fraction = decimal ? decimal[1].replace(/-/g, "0") : "0";
  const amount = parseFloat(`${integer.replace(/\D/g, "")}.${fraction}`);
  return number.startsWith("-") ? -amount : amount;
}

function getItems(node, ...selectors) {
  return Array.from(node.querySelectorAll(selectors.join(",")));
}

const _taxIgnoredSelectorStr = TAX_IGNORED_SELECTORS.join(",");
const _walletContextSelectorStr = WALLET_CONTEXT_SELECTORS.join(",");
const _thirdPartySelectorStr = THIRD_PARTY_SELECTORS.join(",");
const _labelledPriceScopeStr = LABELLED_PRICE_SCOPES.join(",");
const _genericExcludedSelectorStr = [
  ...THIRD_PARTY_SELECTORS,
  ...USER_CONTENT_SELECTORS,
  ...NON_PRICE_ELEMENT_SELECTORS,
].join(",");
const _isCommunity = window.location.hostname === "steamcommunity.com";
const _proseTags = new Set(["A", "B", "EM", "FONT", "I", "SMALL", "SPAN", "STRONG", "U"]);
const _digitRegex = /\d/;
let _priceRegexes = { key: null };

function isTaxIgnored(item) {
  if (item.matches(_taxIgnoredSelectorStr)) return true;
  if (item.closest(_walletContextSelectorStr)) return true;
  // Prices found by the generic detector on the community are market prices.
  return _isCommunity && !item.matches(_commonSelectorStr);
}

function isThirdPartyElement(item) {
  return !!item.closest(_thirdPartySelectorStr);
}

// Regexes for prices in the store currency, so "$1,299.99", "1 299,99€",
// "17 999,00₸", "990.000₫", "Rp 699 999" and "19,--€" all parse.
// - prices: finds every price inside a text, for conversion
// - regex: text that is only a price ("$7.19"); "Under $10 USD" doesn't match
// - labelled: a short label before a price ("From $1.23")
// - hint: cheap check that a text mentions the currency at all
function getPriceRegexes() {
  if (_priceRegexes.key === baseCurrencyKey) return _priceRegexes;

  _priceRegexes = { key: baseCurrencyKey };
  const symbols = [].concat(allCurrencies[baseCurrencyKey] || []);
  if (!baseCurrencyKey || !symbols.length) return _priceRegexes;

  const format = BASE_CURRENCIES.find(
    (currency) => currency.abbr === baseCurrencyKey
  )?.format;
  // Thousands groups are exactly 3 digits and decimals at most 2, with "."
  // or "," for either. Spaces only group digits in currencies that use them.
  const spaceGroups = !format?.thousand?.trim();
  const number = `\\d+(?:[.,'${spaceGroups ? "\\s" : ""}]\\d{3})*(?:[.,](?:\\d{1,2}|--?))?(?!\\d)`;
  const symbol = symbols.map((s) => escapeRegExp(s)).join("|");
  const code = escapeRegExp(baseCurrencyKey);
  const price = `(?:(?:${symbol})\\s*-?${number}(?:\\s*${code})?|${number}(?:\\s*${code})?\\s*(?:${symbol}))`;

  Object.assign(_priceRegexes, {
    hint: new RegExp(`${symbol}|${code}`),
    regex: new RegExp(`^[-−]?\\s*${price}$`),
    labelled: new RegExp(`^[^\\d]{1,25}?\\s*${price}$`),
    prices: new RegExp(
      `(?:${symbol})\\s*(-?${number})(?:\\s*${code})?|(${number})(?:\\s*${code})?\\s*(?:${symbol})`,
      "g"
    ),
  });
  return _priceRegexes;
}

// Prices contain the store currency and a digit; the currency is the rarer
// of the two on Steam's pages (dates and counts have digits), so it goes first.
function hasPriceHint(text) {
  return !!getPriceRegexes().hint?.test(text) && _digitRegex.test(text);
}

function isStandalonePrice(text) {
  if (!text || text.length > 40) return false;
  return !!getPriceRegexes().regex?.test(text);
}

function isLabelledPrice(text) {
  if (!text || text.length > 60) return false;
  return !!getPriceRegexes().labelled?.test(text);
}

// Inline tags without a Steam class inside a sentence are user formatting
// (e.g. a bold "$5" in a review), not price elements.
function isInsideProse(item) {
  if (!_proseTags.has(item.tagName) || item.classList.length) return false;
  const parent = item.parentElement;
  if (!parent) return false;
  return Array.from(parent.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && /\p{L}/u.test(node.nodeValue)
  );
}

// True when el, or an ancestor of it below root, matches the selector.
// The root itself is checked once by the caller, so prices inside a small
// added subtree don't walk all the way up to <html>.
function matchesBelow(el, selector, root) {
  if (!root || root === document.body) return !!el.closest(selector);
  for (let node = el; node && node !== root; node = node.parentElement) {
    if (node.matches(selector)) return true;
  }
  return false;
}

// The element showing a price in this text node, or null. Text nodes are
// checked first because only an element whose own text has a price can be
// converted, so selectors only run for the few text nodes that have one.
function getPriceItem(textNode, root = null, genericAllowed = true) {
  const text = textNode.nodeValue;
  if (!hasPriceHint(text)) return null;
  const item = textNode.parentElement;
  if (!item || getPriceTextNode(item) !== textNode) return null;

  if (item.matches(_commonSelectorStr))
    return matchesBelow(item, _thirdPartySelectorStr, root) ? null : item;

  if (!genericAllowed || text.length > 120) return null;
  const trimmed = text.trim();
  if (
    !isStandalonePrice(trimmed) &&
    !(isLabelledPrice(trimmed) && item.closest(_labelledPriceScopeStr))
  )
    return null;
  if (
    matchesBelow(item, _genericExcludedSelectorStr, root) ||
    isInsideProse(item)
  )
    return null;
  return item;
}

// Finds the price elements in the given roots, e.g. the nodes added in one
// mutation batch.
function collectPriceItems(roots) {
  const items = new Set();
  const { hint } = getPriceRegexes();
  if (!hint) return items;

  let lastParent;
  let parentExcluded = null;
  for (const root of roots) {
    // Most added content has no price at all, so it is skipped before walking
    // the DOM (not the whole page: its text includes large inline scripts).
    if (root !== document.body && !hint.test(root.textContent)) continue;

    // Added nodes are usually siblings, so their parent is only checked once.
    // The excluded list also contains the third-party selectors.
    if (root.parentElement !== lastParent) {
      lastParent = root.parentElement;
      parentExcluded = lastParent?.closest(_genericExcludedSelectorStr) ?? null;
    }
    const excluded = root.matches(_genericExcludedSelectorStr)
      ? root
      : parentExcluded;
    // Content added by other extensions is skipped as a whole.
    if (excluded && isThirdPartyElement(excluded)) continue;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      // Cheap check inline, this runs for every text node in the subtree.
      const text = node.nodeValue;
      if (!hint.test(text) || !_digitRegex.test(text)) continue;
      const item = getPriceItem(node, root, !excluded);
      if (item) items.add(item);
    }
  }
  return items;
}

// Finds the element to convert for a text node that was added or changed.
function resolvePriceItem(textNode) {
  const el = textNode.parentElement;
  if (!el) return null;
  if (el.hasAttribute("data-ext-converted"))
    return isThirdPartyElement(el) ? null : el;
  return getPriceItem(textNode);
}

// React reuses price elements and only swaps their text, so a converted
// element can show a new store price. Only skip text this extension wrote.
const _writtenPriceText = new WeakMap();

function isOwnPriceWrite(item) {
  return (
    _writtenPriceText.get(item) === getPriceTextNode(item)?.nodeValue.trim()
  );
}

// The first direct text node that has content. Only text nodes are ever
// written, so Steam's child elements, styles and React's DOM stay intact.
function getPriceTextNode(item) {
  for (let child = item.firstChild; child; child = child.nextSibling) {
    if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim())
      return child;
  }
  return null;
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

function togglePrice(item) {
  if (item.getAttribute("data-ext-converted") == `${converterActive}`) return;

  const originalPriceText = item.getAttribute("data-ext-price-mem");
  const priceTextNode = getPriceTextNode(item);
  if (!priceTextNode || originalPriceText == null) return;

  item.setAttribute("data-ext-converted", converterActive);
  item.setAttribute("data-ext-price-mem", priceTextNode.nodeValue.trim());
  writePriceText(item, priceTextNode, originalPriceText);
}

function writePriceText(item, textNode, text) {
  _writtenPriceText.set(item, text.trim());
  // Keep the surrounding whitespace, it separates inline elements.
  const currentText = textNode.nodeValue;
  const trimmed = currentText.trim();
  const start = currentText.indexOf(trimmed);
  const newText =
    currentText.slice(0, start) + text + currentText.slice(start + trimmed.length);
  if (newText !== currentText) textNode.nodeValue = newText;
}

function togglePrices() {
  document.querySelectorAll("[data-ext-converted]").forEach(togglePrice);
}
