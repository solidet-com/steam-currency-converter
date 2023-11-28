// Mutation Observers
const observers = [];

const TIME_KEY = {
    ALL: "ALL",
    TRY: "TRY",
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

let converterActive;
let currencyRate;
let currencyKey;
let tax;

const INTERVALS = [
    {
        timeKey: TIME_KEY.ALL,
        value: DAY_IN_MS,
        callback: handleQueryAll,
        afterCallback: handleQueryTRY,
    },
    {
        timeKey: TIME_KEY.TRY,
        value: HOUR_IN_MS / 2,
        callback: handleQueryTRY,
    },
];

const GAME_PAGE_PRICE = ".game_purchase_price";
const PRICE_WO_REGIONAL_EXT=".game_purchase_price > *:not(.es_regional_converter)";
const DISCOUNT_PRICE = ".discount_prices > *:not(.discount_final_price.your_price)";
const YOUR_PRICE = ".discount_final_price:has(.your_price_label) > div:not(:nth-of-type(1))"
const CART_ITEM_PRICE = ".cart_item_price .price";
const SEARCH_ITEM_PRICE = ".match_subtitle";
const TOTAL_CART_PRICE = "#cart_estimated_total";
const DLC_LIST_PRICE = ".game_area_dlc_price:not(.game_area_dlc_price:has(.discount_prices))";

/* -- SUBSCRIPTION SELECTORS -- */
const MONTHLY_SUB_PRICE = "#add_to_cart_2d5d14f95af035cbd8437948de61f94c_selected_text";
const MONTHLY_SUB_OPTION_PRICE = ".game_area_purchase_game_dropdown_menu_item_text";
const EA_PLAY_SERVICE_PRICE=".salesectionsubscription_PriceDisplay_3Ri16.PriceDisplay"
const SUB_INFO_PRICE=".updateSubscriptionOptionPrice"

/* -- TOP_SELLER SELECTORS -- */
const TOP_SELLERS_PAGE_DISC_PRICE = ".salepreviewwidgets_StoreSaleDiscountedPriceCtn_3GLeQ > *";
const TOP_SELLERS_PAGE_PRICE = ".salepreviewwidgets_StoreSalePriceCtn_3R7Q6 > *";
const GAME_WITH_EVENT_PRICE =
    ".eventrow_AppCapsulePrice_Jq75m:not(.eventrow_AppCapsulePrice_Jq75m:has(.salepreviewwidgets_StoreSaleDiscountBox_2fpFv)) > *";
const DLC_DISCOUNT_PRICE = ".salepreviewwidgets_StoreSaleDiscountedPriceCtn_3GLeQ > *";
const DLC_PRICE = ".salepreviewwidgets_StoreSalePriceBox_Wh0L8";

/* -- BUNDLE SELECTORS -- */
const BUNDLE_PACKAGE_PRICE = ".bundle_final_package_price";
const BUNDLE_PCK_DISCOUNT_PRICE = ".bundle_final_price_with_discount";
const BUNDLE_SAVINGS_PRICE = ".bundle_savings";

/* -- MARKET SELECTORS --*/

const MARKET_PRICE = ".market_table_value.normal_price > .normal_price";
const MARKET_NEW_LISTINGS_PRICE = ".market_listing_price_with_fee";
const MARKET_BUY_REQUESTS_PRICE = "#market_commodity_buyrequests > .market_commodity_orders_header_promote:first-child";
const MARKET_FOR_SALE_PRICE = "#market_commodity_forsale > .market_commodity_orders_header_promote:first-child";

/* -- BALANCE SELECTORS -- */

const WALLET_BALANCE = "#header_wallet_balance";
const MARKET_BALANCE = "#marketWalletBalanceAmount";


const COMMON_SELECTORS = [
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
    YOUR_PRICE
    
];


const TAX_IGNORED_SELECTORS = [
    MARKET_BALANCE,
    WALLET_BALANCE,
    MARKET_FOR_SALE_PRICE,
    MARKET_BUY_REQUESTS_PRICE,
    MARKET_PRICE
]