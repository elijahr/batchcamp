import browser from "webextension-polyfill";

import { backgroundStore as store } from "../storage";
import { Item, Message } from "../types";

const isChrome = typeof chrome.downloads.setShelfEnabled !== "undefined";

browser.tabs.onRemoved.addListener(async (tabId: number) => {
  const storage = await store.get();

  if (tabId === storage.tabId) {
    store.set({ tabId: null, items: [] });
    if (isChrome) {
      chrome.downloads.setShelfEnabled(true);
    }
  }
});

const getCurrentTab = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT,
  });

  return tabs[0];
};

const handleNewItems = async (items: Item[]) => {
  if (isChrome) {
    chrome.downloads.setShelfEnabled(false);
  }

  const storage = await store.get();
  let tabId = storage.tabId;

  // is the tab still open?
  try {
    if (tabId) {
      await browser.tabs.get(tabId);
    }
  } catch (error) {
    tabId = null;
  }

  if (!tabId) {
    const currentTab = await getCurrentTab();

    const options: browser.Tabs.CreateCreatePropertiesType = {
      url: browser.runtime.getURL("./src/tab/index.html"),
      index: currentTab.index + 1,
    };

    if (!isChrome) {
      options.cookieStoreId = currentTab.cookieStoreId;
    }

    const tab = await browser.tabs.create(options);

    if ("autoDiscardable" in tab) {
      await browser.tabs.update(tab.id, {
        autoDiscardable: false,
      });
    }

    await store.set({ tabId: tab.id });
  } else {
    browser.tabs.sendMessage(tabId, {
      type: "send-items-to-tab",
      items,
    });

    browser.tabs.update(tabId, {
      active: true,
    });
  }

  store.set({ items });
};

// When the downloads tab loads, send any queued items and clear the queue
const handleNewTabOpened = async () => {
  const storage = await store.get();

  if (storage.tabId && storage.items.length > 0) {
    browser.tabs.sendMessage(storage.tabId, {
      type: "send-items-to-tab",
      items: storage.items,
    });
    await store.set({ items: [] });
  }

  return true;
};

// IMPORTANT: Return a Promise to handle async operations in MV3
// webextension-polyfill automatically handles the response for promises
browser.runtime.onMessage.addListener(async (message: Message) => {
  if (message.type === "ping") {
    return { success: true };
  }

  if (message.type === "send-items-to-background") {
    try {
      await handleNewItems(message.items);
      return { success: true };
    } catch (error) {
      console.error("Error handling new items:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  if (message.type === "tab-opened") {
    try {
      await handleNewTabOpened();
      return { success: true };
    } catch (error) {
      console.error("Error handling tab opened:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  // Fallback
  return { success: true };
});

export {};