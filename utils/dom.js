function getItems(node, ...selectors) {
  return Array.from(node.querySelectorAll(selectors.join(",")));
}

async function updateItems(storedConverter) {
  if (storedConverter) {
    await chrome.storage.local.set({ converterActive: false });
  }
  initItems(true);
  if (storedConverter) {
    await chrome.storage.local.set({ converterActive: true });
  }
}

function getTextNodes(
  node,
  options = {
    level: 1,
    currLevel: 1,
    returnEmpty: false,
  }
) {
  let all = [];
  const { level, currLevel } = options;
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeType == Node.TEXT_NODE) {
      all.push(child);
    } else if (currLevel < level) {
      all = all.concat(
        getTextNodes(child, { ...options, currLevel: currLevel + 1 })
      );
    }
  }

  if (!all.length && !options.returnEmpty) return [node];

  return all;
}
