import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul-base";
import { NavItems } from "./navigation";
import type { CurrentUser } from "./types";
import { UserRow } from "./UserRow";

type MobileNavigationProps = {
  readonly current: string;
  readonly currentUser: CurrentUser;
};

export function MobileNavigation({ current, currentUser }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center border-border border-b bg-sidebar px-4 py-2 md:hidden">
        <a href="/" className="flex min-w-0 items-center gap-2 font-semibold hover:no-underline">
          <img aria-hidden="true" alt="" className="h-8 w-auto shrink-0 object-contain" src="/images/ao3_logos/logo_42.png" />
          <span className="truncate text-sm">Archive of Our Own</span>
        </a>
        <button
          aria-label="Open menu"
          className="ml-auto grid size-10 place-items-center rounded-md transition-[background-color] duration-150 ease-out hover:bg-muted active:scale-[0.96]"
          onClick={() => setOpen(true)}
          type="button"
        >
          <MenuIcon className="size-5" />
        </button>
      </header>

      <Drawer.Root direction="right" onOpenChange={setOpen} open={open}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
          <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[18rem] flex-col border-border border-l bg-sidebar p-4 outline-none md:hidden">
            <a className="mb-4 flex items-center gap-2.5 px-1 font-semibold hover:no-underline" href="/" onClick={() => setOpen(false)}>
              <img aria-hidden="true" alt="" className="h-9 w-auto object-contain" src="/images/ao3_logos/logo_42.png" />
              <span className="text-base">Archive of Our Own</span>
            </a>
            <NavItems current={current} mobile onNavigate={() => setOpen(false)} />
            <UserRow currentUser={currentUser} mobile />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
