export const FEATURES = {
  /**
   * Public/private sharing is experimental.
   * When disabled, all UI and behavior related to visibility is hidden and writes are forced private.
   */
  visibility: import.meta.env.VITE_ENABLE_VISIBILITY === "true",
} as const;
