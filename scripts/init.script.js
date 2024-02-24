function initScript() {
    initItems();
    startObservers();
}

function initItems(onCurrencyChange = false) {
    let newItems = getItems(document, ...COMMON_SELECTORS);
    newItems?.forEach((item) => {
        initItem(item, onCurrencyChange);
        togglePrice(item);
    });
}

async function initCurrency() {
    const targetCurrency = await getStoreValue("targetCurrency");
    baseCurrencykey = await getStoreValue("baseStoreCurrency");
    country = getUserCountry();
    if (baseCurrencykey == null) {
        baseCurrencykey = await getStoreCurrency();

        await chrome.storage.local.set({ baseStoreCurrency: baseCurrencykey });
    }

    const [currency, isDefault] = getCurrencyByCountryCode(country);

    if ((!targetCurrency || !baseCurrencykey) && (!country || isDefault)) {
        const popupHTML = `
        <div id="steam-cc-modal-container">
            <div style="
                background-color: #0000008c;
                position: fixed;
                z-index: 999;
                width: 100vw;
                height: 100vh;
            "></div>
            <div id="steam-cc-version-modal" class="newmodal" style="width: 100%; position: fixed; z-index: 1000; max-width: 1527px; left: 378px; top: 295px;">
                <div class="modal_top_bar"></div>
                <div class="newmodal_header_border">
                    <div class="newmodal_header">
                        <div class="newmodal_close" data-panel="{" focusable":true,"clickOnActivate":true}"></div>
                        <div class="title_text">Augmented Steam has been updated to 3.0.0</div>
                    </div>
                </div>
                <div class="newmodal_content_border">
                    <div class="newmodal_content" style="max-height: 771px;">
                        <div>
                            <div class="es_changelog">
                                <img src="chrome-extension://dnhpnfgdlenaccegplpojghhmaamnnfp/img/logo/as128.png">
                                <div>
                                    <p>Maintenance release to make sure Augmented Steam plays well with the updated ITAD and backing server.</p>

                                    <p><a href="https://github.com/IsThereAnyDeal/AugmentedSteam/compare/v2.6.0...v3.0.0" target="_blank">View all changes on GitHub</a></p>
                                </div>
                            </div>
                        </div>
                        <div class="newmodal_buttons">
                            <div class="btn_grey_steamui btn_medium"><span>OK</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `;

        function handleModalProps(modal) {
            const modalWidth = Math.min(window.innerWidth * 0.8, 1200);
            const horizontalMargin = (window.innerWidth - modalWidth) / 2;

            modal.style.maxWidth = `${modalWidth}px`;
            modal.style.left = `${horizontalMargin}px`;
        }

        document.body.insertAdjacentHTML("afterbegin", popupHTML);
        const modalContainer = document.getElementById("steam-cc-modal-container");
        const modal = document.getElementById("steam-cc-version-modal");
        const closeButton = modal.querySelector(".newmodal_close");
        const okButton = modal.querySelector(".btn_grey_steamui");

        handleModalProps(modal);
        window.addEventListener("resize", (e) => {
            handleModalProps(modal);
        });

        closeButton.addEventListener("click", (e) => {
            modalContainer.remove();
        });

        okButton.addEventListener("click", (e) => {
            modalContainer.remove();
        });
    }

    if (!targetCurrency) await chrome.storage.local.set({ targetCurrency: currency });
}

async function prepareData() {
    const toggleStatus = await chrome.storage.local.get(["converterActive"]);
    converterActive = toggleStatus.converterActive;

    let currency = await getStoreValue("currency");
    tax = await getStoreValue("taxValue");
    targetCurrencyKey = await getStoreValue("targetCurrency");
    baseCurrencykey = await getStoreValue("baseStoreCurrency");

    for (const interval of INTERVALS) {
        const timeStorageKey = getUpdateDateKey(interval.timeKey);
        let updatedDate = await chrome.storage.local.get([timeStorageKey]);

        const lastRefresh = updatedDate[timeStorageKey];
        const isInitial = lastRefresh == null;
        const diff = new Date().getTime() - lastRefresh;

        const callbackPayload = {
            baseCurrencykey,
        };

        if (isInitial || diff > interval.value) {
            currency = await interval.callback(callbackPayload);
            if (interval?.afterCallbacks) {
                interval.afterCallbacks.forEach(async (afterCallback) => {
                    currency = await afterCallback(callbackPayload);
                });
            }
        }
    }

    targetCurrencyRate = currency.rates[targetCurrencyKey] || 1;
}

initCurrency().then(prepareData).then(initScript);
