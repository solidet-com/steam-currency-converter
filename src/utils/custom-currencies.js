const CUSTOM_CURRENCY_STORAGE_KEY = "customCurrencies";
const CUSTOM_CURRENCY_CODES_STORAGE_KEY = "customCurrencyCodes";

const CUSTOM_CURRENCY_PRESETS = [
  { code: "BMC", name: "Big Mac", symbol: "🍔", rate: 5.69, baseCurrency: "USD", places: 2 },
  { code: "SHW", name: "Shawarma", symbol: "🥙", rate: 6.25, baseCurrency: "USD", places: 2 },
  { code: "DNR", name: "Doner", symbol: "🥙", rate: 6.75, baseCurrency: "USD", places: 2 },
  { code: "GYR", name: "Gyro", symbol: "🌯", rate: 8.5, baseCurrency: "USD", places: 2 },
  { code: "TCO", name: "Taco", symbol: "🌮", rate: 3.50, baseCurrency: "USD", places: 2 },
  { code: "PZA", name: "Pizza", symbol: "🍕", rate: 4.00, baseCurrency: "USD", places: 2 },
  { code: "CFE", name: "Coffee", symbol: "☕", rate: 5.50, baseCurrency: "USD", places: 2 },
  { code: "UDT", name: "Tether", symbol: "₮", rate: 1, baseCurrency: "USD", places: 2 },
];

function sanitizeCustomCurrencyCode(rawCode) {
  return String(rawCode || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function normalizeCustomCurrency(code, payload) {
  const normalizedCode = sanitizeCustomCurrencyCode(code);
  const normalizedName = String(payload?.name || "").trim();
  const normalizedSymbol = String(payload?.symbol || normalizedCode).trim();
  const normalizedBaseCurrency = String(payload?.baseCurrency || "")
    .toUpperCase()
    .trim();
  const normalizedRate = Number(payload?.rate);
  const normalizedPlaces = Number.isInteger(payload?.places)
    ? Math.min(8, Math.max(2, payload.places))
    : 2;

  if (
    !normalizedCode ||
    !normalizedName ||
    !normalizedBaseCurrency ||
    !Number.isFinite(normalizedRate) ||
    normalizedRate <= 0
  ) {
    return null;
  }

  return {
    name: normalizedName,
    symbol: normalizedSymbol || normalizedCode,
    rate: normalizedRate,
    baseCurrency: normalizedBaseCurrency,
    places: normalizedPlaces,
  };
}

async function getCustomCurrencies() {
  const result = await chrome.storage.local.get([CUSTOM_CURRENCY_STORAGE_KEY]);
  const customCurrencies = result[CUSTOM_CURRENCY_STORAGE_KEY] || {};
  const normalized = {};
  let hasChanged = false;

  for (const [code, payload] of Object.entries(customCurrencies)) {
    const normalizedEntry = normalizeCustomCurrency(code, payload);
    if (!normalizedEntry) {
      hasChanged = true;
      continue;
    }

    const normalizedCode = sanitizeCustomCurrencyCode(code);
    normalized[normalizedCode] = normalizedEntry;

    if (
      normalizedEntry.rate !== payload?.rate ||
      normalizedEntry.baseCurrency !== payload?.baseCurrency ||
      normalizedEntry.name !== payload?.name ||
      normalizedEntry.symbol !== payload?.symbol ||
      normalizedEntry.places !== payload?.places ||
      normalizedCode !== code
    ) {
      hasChanged = true;
    }
  }

  if (hasChanged) {
    await chrome.storage.local.set({ [CUSTOM_CURRENCY_STORAGE_KEY]: normalized });
  }

  return normalized;
}

async function syncCustomCurrencyRates() {
  const result = await chrome.storage.local.get([
    "currency",
    CUSTOM_CURRENCY_STORAGE_KEY,
    CUSTOM_CURRENCY_CODES_STORAGE_KEY,
  ]);
  const currentCurrency = result.currency;
  if (!currentCurrency?.rates) {
    return;
  }

  const rates = { ...currentCurrency.rates };
  const customCurrencies = result[CUSTOM_CURRENCY_STORAGE_KEY] || {};
  const previousCustomCodes = result[CUSTOM_CURRENCY_CODES_STORAGE_KEY] || [];
  const currentCodes = Object.keys(customCurrencies);

  previousCustomCodes.forEach((code) => {
    if (!customCurrencies[code]) {
      delete rates[code];
    }
  });

  for (const [code, customCurrency] of Object.entries(customCurrencies)) {
    const baseRate = rates[customCurrency.baseCurrency];
    if (baseRate) {
      rates[code] = baseRate / Number(customCurrency.rate);
    }
  }

  await chrome.storage.local.set({
    currency: { ...currentCurrency, rates },
    [CUSTOM_CURRENCY_CODES_STORAGE_KEY]: currentCodes,
  });
}

async function setCustomCurrencies(customCurrencies) {
  await chrome.storage.local.set({ [CUSTOM_CURRENCY_STORAGE_KEY]: customCurrencies });
  await syncCustomCurrencyRates();
}

function isReservedCurrencyCode(code, customCurrencies = null) {
  const normalizedCode = sanitizeCustomCurrencyCode(code);
  if (!normalizedCode) {
    return true;
  }
  const currentCustomCurrencies = customCurrencies || {};
  return Boolean(
    allCurrencies?.[normalizedCode] && !currentCustomCurrencies[normalizedCode]
  );
}

async function upsertCustomCurrency(payload) {
  const code = sanitizeCustomCurrencyCode(payload?.code);
  const customCurrencies = await getCustomCurrencies();
  if (isReservedCurrencyCode(code, customCurrencies)) {
    throw new Error(`Code ${code} is already used by a built-in currency.`);
  }

  const normalized = normalizeCustomCurrency(code, payload);
  if (!normalized) {
    throw new Error("Invalid custom currency payload.");
  }

  customCurrencies[code] = normalized;
  await setCustomCurrencies(customCurrencies);
  return customCurrencies;
}

async function removeCustomCurrency(code) {
  const customCurrencies = await getCustomCurrencies();
  const normalizedCode = sanitizeCustomCurrencyCode(code);
  if (!customCurrencies[normalizedCode]) {
    return customCurrencies;
  }

  delete customCurrencies[normalizedCode];
  await setCustomCurrencies(customCurrencies);
  return customCurrencies;
}

async function loadCustomCurrencies() {
  const customCurrencies = await getCustomCurrencies();

  let customRegion = regions.find((region) => region.name === "CUSTOM");
  if (!customRegion) {
    customRegion = { name: "CUSTOM", currencies: {} };
    regions.unshift(customRegion);
  }

  Object.keys(customRegion.currencies || {}).forEach((code) => {
    delete allCurrencies[code];
  });
  customRegion.currencies = {};

  Object.entries(customCurrencies).forEach(([code, customCurrency]) => {
    const symbol = customCurrency.symbol || code;
    allCurrencies[code] = symbol;
    customRegion.currencies[code] = symbol;
  });

  if (
    typeof BASE_CURRENCIES !== "undefined" &&
    typeof CURRENCY_INFORMATIONS !== "undefined" &&
    Array.isArray(BASE_CURRENCIES) &&
    Array.isArray(CURRENCY_INFORMATIONS)
  ) {
    for (let i = BASE_CURRENCIES.length - 1; i >= 0; i -= 1) {
      if (BASE_CURRENCIES[i]?.isCustom) {
        BASE_CURRENCIES.splice(i, 1);
      }
    }

    for (let i = CURRENCY_INFORMATIONS.length - 1; i >= 0; i -= 1) {
      if (CURRENCY_INFORMATIONS[i]?.isCustom) {
        CURRENCY_INFORMATIONS.splice(i, 1);
      }
    }

    let nextId = Math.max(...BASE_CURRENCIES.map((currency) => currency.id), 0) + 1;
    Object.entries(customCurrencies).forEach(([code, customCurrency]) => {
      const symbol = customCurrency.symbol || code;
      const customCurrencyObject = {
        id: nextId++,
        abbr: code,
        symbol,
        hint: customCurrency.name || `Custom Currency (${code})`,
        multiplier: 100,
        unit: 1,
        format: {
          places: customCurrency.places || 2,
          hidePlacesWhenZero: false,
          symbolFormat: `${symbol} `,
          suffix: ` ${code}`,
          thousand: ",",
          decimal: ".",
          right: false,
        },
        isCustom: true,
        baseCurrency: customCurrency.baseCurrency,
        rate: customCurrency.rate,
      };

      BASE_CURRENCIES.push(customCurrencyObject);
      CURRENCY_INFORMATIONS.push(customCurrencyObject);
    });
  }

  return customCurrencies;
}
