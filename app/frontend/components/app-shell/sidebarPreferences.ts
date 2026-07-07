export const SIDEBAR_WIDTH_STORAGE_KEY = "ao3.react.sidebar.width";
export const SIDEBAR_COLLAPSED_STORAGE_KEY = "ao3.react.sidebar.collapsed";
export const SIDEBAR_DEFAULT_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const SIDEBAR_MIN_WIDTH = 220;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_KEYBOARD_STEP = 16;

export function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

export function readStoredSidebarWidth() {
  if (typeof window === "undefined") {
    return SIDEBAR_DEFAULT_WIDTH;
  }

  try {
    const stored = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    const width = stored ? Number.parseInt(stored, 10) : SIDEBAR_DEFAULT_WIDTH;
    return Number.isFinite(width) ? clampSidebarWidth(width) : SIDEBAR_DEFAULT_WIDTH;
  } catch (error) {
    if (error instanceof DOMException) {
      return SIDEBAR_DEFAULT_WIDTH;
    }

    throw error;
  }
}

export function readStoredSidebarCollapsed() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  } catch (error) {
    if (error instanceof DOMException) {
      return false;
    }

    throw error;
  }
}

export function storeSidebarPreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof DOMException) {
      return;
    }

    throw error;
  }
}
