import { StoreApi } from "zustand/vanilla";

import { ContentState } from "./store";

export const addShiftKeyListener = (store: StoreApi<ContentState>) => {
  const updateShiftKey = (e: KeyboardEvent) => {
    // Update on every key event to track current shift/meta state
    store.getState().toggleShiftKey(Boolean(e.shiftKey || e.metaKey));
  };

  document.addEventListener("keydown", updateShiftKey);
  document.addEventListener("keyup", updateShiftKey);
};
