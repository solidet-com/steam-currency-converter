/*
 * Explicit price selectors.
 *
 * Steam's React pages use generated CSS module classes (e.g. "kauOU9QnW8Fs0QpxzTBph",
 * "QYFii1vIT5Q-") that change with every Steam deploy, so they must never be
 * used here. Standalone prices ("$7.19", "19,99€") are found by the generic
 * detector in dom.js, so only add a selector when the price needs a stable
 * anchor: an id, a readable Steam class, a data attribute or a link target.
 */

const GAME_PAGE_PRICE = ".game_purchase_price";
const PRICE_WO_REGIONAL_EXT =
  ".game_purchase_price > *:not(.es_regional_container)";
const DISCOUNT_PRICE =
  ".discount_prices > *:not(.discount_final_price.your_price):not(.es_regional_container)";
const YOUR_PRICE =
  ".discount_final_price:has(.your_price_label) > div:not(:nth-of-type(1))";
const CART_ITEM_PRICE = ".cart_item_price .price";
const SEARCH_ITEM_PRICE = ".match_subtitle";

const TOTAL_CART_PRICE = "#cart_estimated_total";
const DLC_LIST_PRICE =
  ".game_area_dlc_price:not(.game_area_dlc_price:has(.discount_prices))";
const MORE_LIKE_THIS_PRICE = "a.small_cap > h5 ";
const SIMILIAR_GAME_PRICE = ".similar_grid_price.price > .regular_price.price";
const HIGHLIGHT_GAME_PRICE = ".highlight_description .regular_price.price";
const IN_GAME_ITEM_PRICE = ".item_def_price";
const NEW_CART_DISCOUNT = ".StoreOriginalPrice";

/* -- SUBSCRIPTION SELECTORS -- */
const MONTHLY_SUB_PRICE =
  "#add_to_cart_2d5d14f95af035cbd8437948de61f94c_selected_text";
const MONTHLY_SUB_OPTION_PRICE =
  ".game_area_purchase_game_dropdown_menu_item_text";
const EA_PLAY_2 = ".PriceDisplay";
const SUB_INFO_PRICE = ".updateSubscriptionOptionPrice";
const EA_DEFAULT_SUB_PRICE = ".game_area_purchase_game_dropdown_selection span";
// "$7.99 USD at checkout, auto-renewed every 1 month(s) at $7.99 USD."
const SUBSCRIPTION_TERMS = ".game_purchase_subscription";

/* -- TOP_SELLER SELECTORS -- */
const TOP_SELLERS_PAGE_DISC_PRICE =
  "[class*='salepreviewwidgets_StoreSaleDiscountedPriceCtn_'] > *";
const TOP_SELLERS_PAGE_PRICE =
  "[class*='salepreviewwidgets_StoreSalePriceCtn_'] > *";
const GAME_WITH_EVENT_PRICE =
  "[class*='eventrow_AppCapsulePrice_']:not(:has([class*='salepreviewwidgets_StoreSaleDiscountBox_'])) > *";
const DLC_PRICE = "[class*='salepreviewwidgets_StoreSalePriceBox_']";

/* -- BUNDLE SELECTORS -- */
const BUNDLE_PACKAGE_PRICE = ".bundle_final_package_price";
const BUNDLE_PCK_DISCOUNT_PRICE = ".bundle_final_price_with_discount";
const BUNDLE_SAVINGS_PRICE = ".bundle_savings";
const BUNDLE_PCK_SAVINGS_PRICE = "#package_savings_bar .savings";
const BUNDLE_PCK_PRICE = ".package_totals_row .price";

/* -- MARKET SELECTORS --*/

const MARKET_PRICE = ".market_table_value.normal_price > .normal_price";
const MARKET_NEW_LISTINGS_PRICE = ".market_listing_price_with_fee";
const MARKET_BUY_REQUESTS_PRICE =
  "#market_commodity_buyrequests > .market_commodity_orders_header_promote:first-child";
const MARKET_FOR_SALE_PRICE =
  "#market_commodity_forsale > .market_commodity_orders_header_promote:first-child";
const MARKET_GRAPH_PRICE = "#orders_histogram .jqplot-xaxis-tick";
const MEDIAN_SALE_PRICE = "#pricehistory .jqplot-yaxis-tick";
const MARKET_BUY_ORDER = ".market_commodity_orders_header_promote";
const MARKET_ACTIVITY_PRICE = ".market_activity_cell.market_activity_price";
const MARKET_COMMODITY_TABLE_PRICE =
  ".market_commodity_orders_table td:first-child";

const INVENTORY_ITEM_PRICE = ".item_market_actions";
const ITEM_TEST =
  "div[id$=item_market_actions] div[style='min-height: 3em; margin-left: 1em;'] ";

/* -- BALANCE SELECTORS -- */

const WALLET_BALANCE = "#header_wallet_balance";
const PENDING_MARKET_BALANCE = "#header_wallet_balance>span";
const MARKET_BALANCE = "#marketWalletBalanceAmount";
const ACCOUNT_BALANCE = ".accountBalance .accountData.price > a";

/* -- HARDWARE PRODUCTS SELECTORS -- */
const HARDWARE_PRICE = ".bbcode_price_final";

const COMMON_SELECTORS = [
  EA_PLAY_2,
  DISCOUNT_PRICE,
  GAME_PAGE_PRICE,
  PRICE_WO_REGIONAL_EXT,
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
  WALLET_BALANCE,
  MARKET_PRICE,
  MARKET_BALANCE,
  MARKET_NEW_LISTINGS_PRICE,
  MARKET_BUY_REQUESTS_PRICE,
  MARKET_FOR_SALE_PRICE,
  MONTHLY_SUB_PRICE,
  MONTHLY_SUB_OPTION_PRICE,
  SUB_INFO_PRICE,
  SUBSCRIPTION_TERMS,
  YOUR_PRICE,
  INVENTORY_ITEM_PRICE,
  BUNDLE_PCK_SAVINGS_PRICE,
  BUNDLE_PCK_PRICE,
  MORE_LIKE_THIS_PRICE,
  SIMILIAR_GAME_PRICE,
  HIGHLIGHT_GAME_PRICE,
  IN_GAME_ITEM_PRICE,
  MARKET_GRAPH_PRICE,
  MARKET_BUY_ORDER,
  MARKET_ACTIVITY_PRICE,
  MARKET_COMMODITY_TABLE_PRICE,
  MEDIAN_SALE_PRICE,
  ITEM_TEST,
  EA_DEFAULT_SUB_PRICE,
  HARDWARE_PRICE,
  NEW_CART_DISCOUNT,
  PENDING_MARKET_BALANCE,
  ACCOUNT_BALANCE,
];

const TAX_IGNORED_SELECTORS = [
  MARKET_BALANCE,
  WALLET_BALANCE,
  ACCOUNT_BALANCE,
  MARKET_NEW_LISTINGS_PRICE,
  MARKET_FOR_SALE_PRICE,
  MARKET_BUY_REQUESTS_PRICE,
  MARKET_PRICE,
  MARKET_GRAPH_PRICE,
  MARKET_BUY_ORDER,
  MARKET_ACTIVITY_PRICE,
  MARKET_COMMODITY_TABLE_PRICE,
  MEDIAN_SALE_PRICE,
  INVENTORY_ITEM_PRICE,
];

/* -- GENERIC DETECTION SCOPES -- */

// Wallet balances are shown in these areas; no tax is added to them.
const WALLET_CONTEXT_SELECTORS = [
  "header",
  "#global_header",
  "#account_dropdown",
  "a[href*='/steamaccount/addfunds']",
  "a[href*='/account/store_transactions']",
  ".accountBalance",
  ".addfunds_accountBalance",
];

// Areas where Steam shows a label and a price in one text node, e.g. market
// search "From $1.23" or the inventory item panel "Starting at: $0.04 USD".
// Only here a short label before the price is accepted.
const LABELLED_PRICE_SCOPES = [
  "a[href*='/market/listings/']",
  "[data-featuretarget='iteminfo']",
];

// Elements created by other extensions (Augmented Steam, ITAD, SteamDB).
// Augmented Steam also adds es_* classes and ids to Steam's own elements
// (e.g. .es_regional_prices on the purchase box, #es_selected_btn), so only
// match containers these extensions create themselves.
const THIRD_PARTY_SELECTORS = [
  "[class*='svelte-']",
  "[class^='steamdb_']",
  "[class*=' steamdb_']",
  "[class^='itad-']",
  "[class*=' itad-']",
  ".es_regional",
  ".es_regional_container",
  ".es_each_box",
  ".es_each_price",
  ".es_qsell_ctn",
  "[id^='as-']",
  "[id^='as_']",
];

// User written text (descriptions, reviews, comments) is never converted.
const USER_CONTENT_SELECTORS = [
  "#game_area_description",
  ".game_area_description",
  ".review_box .content",
  ".recommendation_desc",
  ".apphub_CardTextContent",
  ".commentthread_comment_text",
  ".forum_op",
  ".workshopItemDescription",
  ".profile_summary",
  ".bb_blockquote",
];

const NON_PRICE_ELEMENT_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "textarea",
  "input",
  "select",
  "option",
  "[contenteditable]",
];
