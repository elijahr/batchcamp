import browser from "webextension-polyfill";
import { StoreApi } from "zustand/vanilla";

import { ContentState } from "../store";

export const createDownloadButton = (store: StoreApi<ContentState>) => {
  const onDownloadButtonClicked = async () => {
    const { selected, resetSelected } = store.getState();

    try {
      // Await the message - this will wake up the service worker if inactive
      const response = await browser.runtime.sendMessage({
        type: "send-items-to-background",
        items: Object.values(selected).filter((x) => x),
      });

      if (!response || response.success !== true) {
        throw new Error(response?.error || "Background script did not acknowledge request");
      }

      // Only reset after successful message delivery
      resetSelected();
    } catch (error) {
      console.error("Failed to send items to background:", error);
      alert("Failed to start download. Please try again.");
    }
  };

  const button = document.createElement("button");
  button.className = "btn btn-primary fixed bottom-4 right-4 z-[1000] hidden";
  button.setAttribute("id", "download-all");
  button.onclick = onDownloadButtonClicked;

  return button;
};
