const latamCurrencies = {
    ARS: "AR$",
    PAB: "B/.",
    GTQ: "Q",
    HNL: "L",
    NIO: "C$",
    BZD: "BZ$",
    BOB: "Bs.",
    GYD: "G$",
    PYG: "₲",
    SRD: "Sr$",
    AWG: "ƒ",
    BRL: "R$",
    BSD: "BSD$",
    CLP: "CLP$",
    COP: "COL$",
    CRC: "₡",
    CUP: "CUP$",
    DOP: "RD$",
    FKP: "FKP£",
    HNL: "L",
    HTG: "G",
    KHR: "៛",
    KYD: "KYD$",
    MVR: "ރ.",
};

const menaCurrencies = {
    TRY: "₺",
    BHD: ".د.ب",
    EGP: "EGP£",
    IQD: "ع.د",
    JOD: "JD",
    LBP: "LBP£",
    OMR: "﷼",
    YER: "﷼",
    DZD: "د.ج",
    MAD: "د.م.",
    TND: "د.ت",
    SDG: "S£",
    SSP: "SSP£",
    LYD: "ل.د",
    ILS: "₪",
    AED: "د.إ",
    AZN: "₼",
    IRR: "﷼",
    KWD: "KD",
};

const africaCurrencies = {
    AOA: "Kz",
    CVE: "CVE$",
    DJF: "Fdj",
    ERN: "Nfk",
    ETB: "Br",
    GHS: "₵",
    GMD: "D",
    GNF: "FG",
    JMD: "J$",
    KES: "Ksh",
    KMF: "CF",
    LRD: "LRD$",
    ZAR: "R",
    LSL: "L",
    MGA: "Ar",
    MZN: "MT",
    NAD: "N$",
    NGN: "₦",
};

const sasiaCurrencies = {
    BDT: "৳",
    BTN: "Nu.",
    INR: "₹",
    NPR: "₨",
    PKR: "₨",
    LKR: "රු",
    BND: "B$",
    KRW: "₩",
};

const cisCurrencies = {
    AMD: "֏",
    AZN: "₼",
    BYN: "Br",
    GEL: "₾",
    KZT: "₸",
    KGS: "сом",
    MDL: "lei",
    TJS: "ЅМ",
    TMT: "T",
    UZS: "soʻm",
    UAH: "₴",
    RUB: "pуб.",
};

const euCurrencies = {
    PLN: "zł",
    DKK: "kr",
    EUR: "€",
    BGN: "лв",
    RON: "lei",
    ALL: "L",
    ANG: "ƒ",
    BAM: "KM",
    CHF: "CHF",
    CZK: "Kč",
    FOK: "kr",
    GBP: "£",
    GGP: "GGP£",
    GIP: "GIP£",
    HRK: "kn",
    HUF: "Ft",
    IMP: "IMP£",
    ISK: "kr",
    JEP: "JEP£",
    MKD: "ден",
    NOK: "kr",
};

const naCurrencies = {
    USD: "$",
    CAD: "CA$",
    BMD: "BMD$",
    MXN: "Mex$",
};

const asiaCurrencies = {
    AFN: "؋",
    CNY: "¥",
    HKD: "HK$",
    IDR: "Rp",
    JPY: "¥",
    LAK: "₭",
    MMK: "Ks",
    MNT: "₮",
    MYR: "RM",
};

const oceniaCurrencies = {
    AUD: "A$",
    NZD: "NZ$",
    FJD: "FJ$",
    PGK: "K",
    SBD: "SI$",
    TOP: "T$",
    VUV: "Vt",
    WST: "WS$",
    XPF: "₣",
    KID: "KID$",
};

const regions = [
    { name: "LATAM", currencies: latamCurrencies },
    { name: "MENA", currencies: menaCurrencies },
    { name: "SASIA", currencies: sasiaCurrencies },
    { name: "CIS", currencies: cisCurrencies },
    { name: "EU", currencies: euCurrencies },
    { name: "NA", currencies: naCurrencies },
    { name: "ASIA", currencies: asiaCurrencies },
    { name: "OCENIA", currencies: oceniaCurrencies },
    { name: "AFRICA", currencies: africaCurrencies },
];

const allCurrencies = {
    USD: "$",
    AED: "د.إ",
    AFN: "؋",
    ALL: "L",
    AMD: "֏",
    ANG: "ƒ",
    AOA: "Kz",
    ARS: "AR$",
    AUD: "A$",
    AWG: "ƒ",
    AZN: "₼",
    BAM: "KM",
    BBD: "BBD$",
    BDT: "৳",
    BGN: "лв",
    BHD: ".د.ب",
    BIF: "FBu",
    BMD: "BMD$",
    BND: "B$",
    BOB: "Bs.",
    BRL: "R$",
    BSD: "BSD$",
    BTN: "Nu.",
    BWP: "P",
    BYN: "Br",
    BZD: "BZ$",
    CAD: "CA$",
    CDF: "FC",
    CHF: "CHF",
    CLP: "CLP$",
    CNY: "¥",
    COP: "COL$",
    CRC: "₡",
    CUP: "CUP$",
    CVE: "CVE$",
    CZK: "Kč",
    DJF: "Fdj",
    DKK: "kr",
    DOP: "RD$",
    DZD: "د.ج",
    EGP: "EGP£",
    ERN: "Nfk",
    ETB: "Br",
    EUR: "€",
    FJD: "FJ$",
    FKP: "FKP£",
    FOK: "kr",
    GBP: "£",
    GEL: "₾",
    GGP: "GGP£",
    GHS: "₵",
    GIP: "GIP£",
    GMD: "D",
    GNF: "FG",
    GTQ: "Q",
    GYD: "G$",
    HKD: "HK$",
    HNL: "L",
    HRK: "kn",
    HTG: "G",
    HUF: "Ft",
    IDR: "Rp",
    ILS: "₪",
    IMP: "IMP£",
    INR: "₹",
    IQD: "ع.د",
    IRR: "﷼",
    ISK: "kr",
    JEP: "JEP£",
    JMD: "J$",
    JOD: "JD",
    JPY: "¥",
    KES: "Ksh",
    KGS: "сом",
    KHR: "៛",
    KID: "KID$",
    KMF: "CF",
    KRW: "₩",
    KWD: "KD",
    KYD: "KYD$",
    KZT: "₸",
    LAK: "₭",
    LBP: "LBP£",
    LKR: "රු",
    LRD: "LRD$",
    LSL: "L",
    LYD: "ل.د",
    MAD: "د.م.",
    MDL: "lei",
    MGA: "Ar",
    MKD: "ден",
    MMK: "Ks",
    MNT: "₮",
    MOP: "MOP$",
    MRU: "UM",
    MUR: "₨",
    MVR: "ރ.",
    MWK: "MK",
    MXN: "Mex$",
    MYR: "RM",
    MZN: "MT",
    NAD: "N$",
    NGN: "₦",
    NIO: "C$",
    NOK: "kr",
    NPR: "₨",
    NZD: "NZ$",
    OMR: "﷼",
    PAB: "B/.",
    PEN: "S/",
    PGK: "K",
    PHP: "₱",
    PKR: "₨",
    PLN: "zł",
    PYG: "₲",
    QAR: "ر.ق",
    RON: "lei",
    RSD: "Дин.",
    RUB: "pуб.",
    RWF: "RF",
    SAR: "ر.س",
    SBD: "SI$",
    SCR: "₨",
    SDG: "S£",
    SEK: "kr",
    SGD: "S$",
    SHP: "SHP£",
    SLE: "Le",
    SLL: "Le",
    SOS: "S",
    SRD: "Sr$",
    SSP: "SSP£",
    STN: "Db",
    SYP: "SYP£",
    SZL: "L",
    THB: "฿",
    TJS: "ЅМ",
    TMT: "T",
    TND: "د.ت",
    TOP: "T$",
    TRY: "₺",
    TTD: "TT$",
    TVD: "T$",
    TWD: "NT$",
    TZS: "TSh",
    UAH: "₴",
    UGX: "USh",
    UYU: "$U",
    UZS: "soʻm",
    VES: "Bs",
    VND: "₫",
    VUV: "Vt",
    WST: "WS$",
    XAF: "FCFA",
    XCD: "EC$",
    XDR: "SDR",
    XOF: "CFA",
    XPF: "₣",
    YER: "﷼",
    ZAR: "R",
    ZMW: "ZK",
    ZWL: "Z$",
    USD: "$",
};