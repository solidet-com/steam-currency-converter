const GENERAL_PRICE_CONTAINER = ".StoreSalePriceWidgetContainer";

const NEW_DISCOUNT_PRICE = "._1EKGZBnKFWOr3RqVdnLMRN";
const NEW_FINAL_PRICE = ".Wh0L8EnwsPV_8VAu8TOYr";

const GAME_PAGE_PRICE = ".game_purchase_price";
const PRICE_WO_REGIONAL_EXT =
  ".game_purchase_price > *:not(.es_regional_container)";
const DISCOUNT_PRICE =
  ".discount_prices > *:not(.discount_final_price.your_price)";
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

/* -- SUBSCRIPTION SELECTORS -- */
const MONTHLY_SUB_PRICE =
  "#add_to_cart_2d5d14f95af035cbd8437948de61f94c_selected_text";
const MONTHLY_SUB_OPTION_PRICE =
  ".game_area_purchase_game_dropdown_menu_item_text";
const EA_PLAY_SERVICE_PRICE =
  ".salesectionsubscription_PriceDisplay_3Ri16.PriceDisplay";
const EA_PLAY_2 = ".PriceDisplay";
const SUB_INFO_PRICE = ".updateSubscriptionOptionPrice";
const EA_DEFAULT_SUB_PRICE = ".game_area_purchase_game_dropdown_selection span";

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

const INVENTORY_ITEM_PRICE = ".item_market_actions";
const ITEM_TEST =
  "div[id$=item_market_actions] div[style='min-height: 3em; margin-left: 1em;'] ";

/* -- BALANCE SELECTORS -- */

const WALLET_BALANCE = "#header_wallet_balance";
const MARKET_BALANCE = "#marketWalletBalanceAmount";

/* -- HARDWARE PRODUCTS SELECTORS -- */
const HARDWARE_PRICE = ".bbcode_price_final";

const COMMON_SELECTORS = [
  //GENERAL_PRICE_CONTAINER,
  EA_PLAY_2,
  NEW_DISCOUNT_PRICE,
  NEW_FINAL_PRICE,
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
  EA_PLAY_SERVICE_PRICE,
  SUB_INFO_PRICE,
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
  MEDIAN_SALE_PRICE,
  ITEM_TEST,
  EA_DEFAULT_SUB_PRICE,
  HARDWARE_PRICE,
];

const TAX_IGNORED_SELECTORS = [
  MARKET_BALANCE,
  WALLET_BALANCE,
  MARKET_NEW_LISTINGS_PRICE,
  MARKET_FOR_SALE_PRICE,
  MARKET_BUY_REQUESTS_PRICE,
  MARKET_PRICE,
  MARKET_GRAPH_PRICE,
  MARKET_BUY_ORDER,
  MEDIAN_SALE_PRICE,
  INVENTORY_ITEM_PRICE,
];
