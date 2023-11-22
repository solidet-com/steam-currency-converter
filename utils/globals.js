// Mutation Observers
const observers = [];

const items = new Set();
const colors = {};
let converterActive;

const GAME_PAGE_PRICE = ".game_purchase_price";
const DISCOUNT_PRICE = ".discount_prices > *";
const CART_ITEM_PRICE = ".cart_item_price .price";
const SEARCH_ITEM_PRICE = ".match_subtitle";
const TOTAL_CART_PRICE = "#cart_estimated_total";
const DLC_LIST_PRICE =
  ".game_area_dlc_price:not(.game_area_dlc_price:has(.discount_prices))";

const MONTHLY_SUB_PRICE =
  "#add_to_cart_2d5d14f95af035cbd8437948de61f94c_selected_text";
const MONTHLY_SUB_OPTION_PRICE =
  ".game_area_purchase_game_dropdown_menu_item_text";

/* -- TOP_SELLER SELECTORS -- */
const TOP_SELLERS_PAGE_DISC_PRICE =
  ".salepreviewwidgets_StoreSaleDiscountedPriceCtn_3GLeQ > *";
const TOP_SELLERS_PAGE_PRICE =
  ".salepreviewwidgets_StoreSalePriceCtn_3R7Q6 > *";
const GAME_WITH_EVENT_PRICE =
  ".eventrow_AppCapsulePrice_Jq75m:not(.eventrow_AppCapsulePrice_Jq75m:has(.salepreviewwidgets_StoreSaleDiscountBox_2fpFv)) > *";
const DLC_DISCOUNT_PRICE =
  ".salepreviewwidgets_StoreSaleDiscountedPriceCtn_3GLeQ > *";
const DLC_PRICE = ".salepreviewwidgets_StoreSalePriceBox_Wh0L8";

/* -- BUNDLE SELECTORS -- */
const BUNDLE_PACKAGE_PRICE = ".bundle_final_package_price";
const BUNDLE_PCK_DISCOUNT_PRICE = ".bundle_final_price_with_discount";
const BUNDLE_SAVINGS_PRICE = ".bundle_savings";

const COMMON_SELECTORS = [
  DISCOUNT_PRICE,
  GAME_PAGE_PRICE,
  CART_ITEM_PRICE,
  TOTAL_CART_PRICE,
  TOP_SELLERS_PAGE_PRICE,
  TOP_SELLERS_PAGE_DISC_PRICE,
  GAME_WITH_EVENT_PRICE,
  DLC_LIST_PRICE,
  DLC_PRICE,
  BUNDLE_PACKAGE_PRICE,
  BUNDLE_PCK_DISCOUNT_PRICE,
  BUNDLE_SAVINGS_PRICE,
];
let exchangeRatePromise;
