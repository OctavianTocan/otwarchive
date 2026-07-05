import { usePage } from "@inertiajs/react";
import { useState, type ReactNode } from "react";
import {
  HomeIcon, BookOpenIcon, BookmarkIcon, FolderIcon, TagIcon,
  SearchIcon, MenuIcon, XIcon, UserIcon,
} from "lucide-react";

const NAV = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "Works", href: "/works", Icon: BookOpenIcon },
  { label: "Bookmarks", href: "/bookmarks", Icon: BookmarkIcon },
  { label: "Collections", href: "/collections", Icon: FolderIcon },
  { label: "Tags", href: "/media", Icon: TagIcon },
  { label: "Search", href: "/works/search", Icon: SearchIcon },
];

type Shared = { currentUser?: { id: number; login: string } | null };

function NavItems({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ label, href, Icon }) => {
        const active = href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
        return (
          <a key={href} href={href} onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-sm transition-colors hover:no-underline ${
              active ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
            }`}>
            <Icon className="size-4 shrink-0" />
            {label}
          </a>
        );
      })}
    </nav>
  );
}

function SidebarBody({ currentUser, current, onNavigate }: Shared & { current: string; onNavigate?: () => void }) {
  return (
    <>
      <a href="/" onClick={onNavigate} className="mb-4 flex items-center gap-2.5 px-1 font-semibold text-base hover:no-underline">
        <img src="/images/ao3_logos/logo.png" alt="AO3" className="size-8 shrink-0 object-contain" />
        <span className="leading-tight">Archive of Our Own</span>
      </a>
      <NavItems current={current} onNavigate={onNavigate} />
      <div className="mt-auto border-border border-t pt-3">
        <a href={currentUser ? `/users/${currentUser.login}` : "/users/login"} onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-foreground/70 text-sm hover:bg-muted hover:text-foreground hover:no-underline">
          <UserIcon className="size-4 shrink-0" />
          {currentUser ? currentUser.login : "Log in"}
        </a>
      </div>
    </>
  );
}

/** App chrome: sticky left sidebar on desktop, sticky top bar + drawer on mobile. */
export default function AppShell({ children }: { children: ReactNode }) {
  const page = usePage<Shared>();
  const currentUser = (page.props as Shared).currentUser;
  const current = page.url.split("?")[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-svh bg-background text-foreground md:flex">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-border border-r bg-sidebar p-3 md:flex">
        <SidebarBody currentUser={currentUser} current={current} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center gap-2 border-border border-b bg-sidebar px-4 py-2.5 md:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-md hover:bg-muted"><MenuIcon className="size-5" /></button>
        <a href="/" className="flex items-center gap-2 font-semibold hover:no-underline">
          <img src="/images/ao3_logos/logo.png" alt="AO3" className="size-7 object-contain" />
          Archive of Our Own
        </a>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar p-3 shadow-lg">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}
              className="mb-1 ml-auto grid size-8 place-items-center rounded-md hover:bg-muted"><XIcon className="size-5" /></button>
            <SidebarBody currentUser={currentUser} current={current} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
