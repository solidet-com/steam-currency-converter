// Mutation Observers
const observers = [];

let converterActive;
let targetCurrencyRate;
let targetCurrencyKey;
let tax;
let baseCurrencyKey;
let country;

const INTERVALS = [
  {
    timeKey: TIME_KEY.ALL,
    value: DAY_IN_MS,
    callback: updateRatesALL,
    afterCallbacks: [updateRatesTRY],
  },
  {
    timeKey: TIME_KEY.TRY,
    value: HOUR_IN_MS / 2,
    callback: updateRatesTRY,
  },
  // TODO: Find new source for ARS, other one blocked with cloudflare
  // {
  //   timeKey: TIME_KEY.ARS,
  //   value: HOUR_IN_MS,
  //   callback: updateRatesARS,
  // },
];
