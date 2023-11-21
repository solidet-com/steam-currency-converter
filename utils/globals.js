// Mutation Observers
const observers = [];

const items = new Set();
const colors = {};

const GAME_PAGE_PRICE = ".game_purchase_price";
const DISCOUNT_PRICE = ".discount_prices > *";
const CART_ITEM_PRICE = ".cart_item_price .price";
const SEARCH_ITEM_PRICE = ".match_subtitle";
const TOTAL_CART_PRICE = "#cart_estimated_total";
const COMMON_SELECTORS = [
  DISCOUNT_PRICE,
  GAME_PAGE_PRICE,
  CART_ITEM_PRICE,
  TOTAL_CART_PRICE
];
let exchangeRatePromise;
