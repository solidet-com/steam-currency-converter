function handleModalClose(modal) {
  modal.remove();
}

function handleModalSize(modal) {
  const modalWidth = Math.min(window.innerWidth * 0.8, 1200);
  const horizontalMargin = (window.innerWidth - modalWidth) / 2;

  modal.style.maxWidth = `${modalWidth}px`;
  modal.style.left = `${horizontalMargin}px`;
}

function showChangelogModal(title, body) {
  chrome.storage.local.set({ showChangelog: false });
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
                        <div class="title_text">${title}</div>
                    </div>
                </div>
                <div class="newmodal_content_border">
                    <div class="newmodal_content" style="max-height: 771px;">
                        <div>
                            <div class="es_changelog">
                                <img src="${EXTENSION_LOGO_BASE64}">
                                <div>
                                    ${body}
                                    <p><a href="https://github.com/solidet-com/steam-currency-converter" target="_blank">Refer to GitHub</a></p>
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

  document.body.insertAdjacentHTML("afterbegin", popupHTML);
  const modalContainer = document.getElementById("steam-cc-modal-container");
  const modal = document.getElementById("steam-cc-version-modal");
  const closeButton = modal.querySelector(".newmodal_close");
  const okButton = modal.querySelector(".btn_grey_steamui");

  handleModalSize(modal);
  window.addEventListener("resize", (e) => {
    handleModalSize(modal);
  });

  closeButton.addEventListener("click", (e) => {
    handleModalClose(modalContainer);
  });

  okButton.addEventListener("click", (e) => {
    handleModalClose(modalContainer);
  });
}
