import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { NavItems } from "./navigation";
import {
  clampSidebarWidth,
  readStoredSidebarCollapsed,
  readStoredSidebarWidth,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_KEYBOARD_STEP,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  storeSidebarPreference,
} from "./sidebarPreferences";
import type { CurrentUser } from "./types";
import { UserRow } from "./UserRow";

type DesktopSidebarProps = {
  readonly current: string;
  readonly currentUser: CurrentUser;
};

export function DesktopSidebar({ current, currentUser }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(readStoredSidebarCollapsed);
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth);

  useEffect(() => {
    storeSidebarPreference(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    storeSidebarPreference(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const startResize = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      setSidebarWidth(clampSidebarWidth(startWidth + moveEvent.clientX - startX));
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
  }, [sidebarWidth]);

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSidebarWidth((width) => clampSidebarWidth(width - SIDEBAR_KEYBOARD_STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setSidebarWidth((width) => clampSidebarWidth(width + SIDEBAR_KEYBOARD_STEP));
    } else if (event.key === "Home") {
      event.preventDefault();
      setSidebarWidth(SIDEBAR_MIN_WIDTH);
    } else if (event.key === "End") {
      event.preventDefault();
      setSidebarWidth(SIDEBAR_MAX_WIDTH);
    }
  };

  const sidebarStyle: CSSProperties = {
    width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth,
  };

  return (
    <aside
      className="sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-border border-r bg-sidebar p-3 shadow-[inset_-1px_0_0_rgb(255_255_255/0.55)] md:flex"
      style={sidebarStyle}
    >
      <div className={`mb-4 flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
        <a href="/" className="flex min-w-0 items-center gap-2 font-semibold hover:no-underline">
          <img aria-hidden="true" alt="" className="h-8 w-auto shrink-0 object-contain" src="/images/logo.png" />
          {!collapsed && <span className="truncate text-[15px] leading-tight">Archive of Our Own</span>}
        </a>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-[background-color,color] duration-150 ease-out hover:bg-muted hover:text-foreground active:scale-[0.96] ${collapsed ? "" : "ml-auto"}`}
          onClick={() => setCollapsed((value) => !value)}
          type="button"
        >
          {collapsed ? <PanelLeftIcon className="size-4" /> : <PanelLeftCloseIcon className="size-4" />}
        </button>
      </div>
      <NavItems collapsed={collapsed} current={current} />
      <UserRow collapsed={collapsed} currentUser={currentUser} />
      {!collapsed && (
        <div
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuenow={sidebarWidth}
          className="absolute top-0 right-[-4px] z-10 h-full w-2 cursor-col-resize rounded-full outline-none transition-[background-color] duration-150 ease-out hover:bg-link/20 focus-visible:bg-link/25 focus-visible:ring-2 focus-visible:ring-link/40"
          onKeyDown={resizeWithKeyboard}
          onPointerDown={startResize}
          role="separator"
          tabIndex={0}
        />
      )}
    </aside>
  );
}
