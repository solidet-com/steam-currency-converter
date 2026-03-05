/**
 * Shared searchable dropdown widget.
 * Reused across index, choose-currency and custom-currencies pages.
 */
function initSearchableDropdown(sd, onChange) {
  const trigger = sd.querySelector(".sd-trigger");
  const panel = sd.querySelector(".sd-panel");
  const search = sd.querySelector(".sd-search");
  const optionsContainer = sd.querySelector(".sd-options");
  let selectedValue = null;
  let allEntries = [];

  function open() {
    document.querySelectorAll(".sd-panel.open").forEach((p) => {
      if (p !== panel) p.classList.remove("open");
    });
    panel.classList.add("open");
    search.value = "";
    filterOptions("");
    search.focus();
  }

  function close() {
    panel.classList.remove("open");
  }

  function filterOptions(query) {
    const q = query.toLowerCase();
    let lastGroupEl = null;
    let groupHasVisible = false;

    optionsContainer.querySelectorAll(".sd-group, .sd-option, .sd-empty").forEach((el) => {
      if (el.classList.contains("sd-empty")) {
        el.remove();
        return;
      }
      if (el.classList.contains("sd-group")) {
        if (lastGroupEl && !groupHasVisible) lastGroupEl.style.display = "none";
        lastGroupEl = el;
        groupHasVisible = false;
        el.style.display = "";
        return;
      }
      const text = (el.dataset.value + " " + el.textContent + " " + (el.dataset.hint || "")).toLowerCase();
      const visible = !q || text.includes(q);
      el.style.display = visible ? "" : "none";
      if (visible) groupHasVisible = true;
    });

    if (lastGroupEl && !groupHasVisible) lastGroupEl.style.display = "none";

    const anyVisible = optionsContainer.querySelector(".sd-option:not([style*='display: none'])");
    if (!anyVisible) {
      const empty = document.createElement("div");
      empty.className = "sd-empty";
      empty.textContent = "No results";
      optionsContainer.appendChild(empty);
    }
  }

  function selectValue(value, label) {
    selectedValue = value;
    trigger.textContent = label || value;
    optionsContainer.querySelectorAll(".sd-option").forEach((o) => {
      o.classList.toggle("selected", o.dataset.value === value);
    });
    close();
    if (onChange) onChange(value);
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) {
      close();
    } else {
      open();
    }
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  search.addEventListener("input", () => filterOptions(search.value));

  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return {
    populate(entries) {
      allEntries = entries;
      optionsContainer.innerHTML = "";
      entries.forEach((entry) => {
        if (entry.group) {
          const g = document.createElement("div");
          g.className = "sd-group";
          g.textContent = entry.group;
          optionsContainer.appendChild(g);
        } else {
          const o = document.createElement("div");
          o.className = "sd-option";
          if (entry.value === selectedValue) o.classList.add("selected");
          o.dataset.value = entry.value;
          if (entry.hint) o.dataset.hint = entry.hint;
          o.textContent = entry.label;
          o.addEventListener("click", () => selectValue(entry.value, entry.label));
          optionsContainer.appendChild(o);
        }
      });
    },
    setValue(value) {
      selectedValue = value;
      const match = allEntries.find((e) => e.value === value);
      trigger.textContent = match?.label || value;
      optionsContainer.querySelectorAll(".sd-option").forEach((o) => {
        o.classList.toggle("selected", o.dataset.value === value);
      });
    },
    getValue() {
      return selectedValue;
    },
  };
}
