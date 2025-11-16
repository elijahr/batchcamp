import browser from "webextension-polyfill";
import { StoreApi } from "zustand/vanilla";

import { ContentState } from "../store";

export const createDownloadButton = (store: StoreApi<ContentState>) => {
  const onDownloadButtonClicked = async () => {
    const { selected, resetSelected } = store.getState();

    try {
      // Optional wake-up ping for MV3 service worker
      try {
        await browser.runtime.sendMessage({ type: "ping" });
      } catch {
        // ignore ping failures; we'll still try to send the real message
      }

      // Await the message and require a success response
      const response = await browser.runtime.sendMessage({
        type: "send-items-to-background",
        items: Object.values(selected).filter((x) => x),
      });

      if (!response || response.success !== true) {
        throw new Error(
          response?.error || "Background script did not acknowledge request"
        );
      }

      // Only reset after successful delivery
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
