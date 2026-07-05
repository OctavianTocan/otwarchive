import { usePage } from "@inertiajs/react";
import { useState, type ReactNode } from "react";
import { Drawer } from "vaul-base";
import {
  HomeIcon, BookOpenIcon, BookmarkIcon, FolderIcon, TagIcon,
  SearchIcon, MenuIcon, UserIcon, PanelLeftCloseIcon, PanelLeftIcon,
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

function NavItems({ current, collapsed, mobile, onNavigate }: { current: string; collapsed?: boolean; mobile?: boolean; onNavigate?: () => void }) {
  return (
    <nav className={`flex flex-col ${mobile ? "gap-1.5" : "gap-0.5"}`}>
      {NAV.map(({ label, href, Icon }) => {
        const active = href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
        return (
          <a key={href} href={href} onClick={onNavigate} title={collapsed ? label : undefined}
            className={`flex items-center font-medium transition-colors hover:no-underline ${
              mobile ? "gap-3.5 rounded-xl px-4 py-3 text-[15px]" : `gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${collapsed ? "justify-center" : ""}`
            } ${active ? "bg-accent text-accent-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground active:bg-muted"}`}>
            <Icon className={`shrink-0 ${mobile ? "size-[22px]" : "size-[18px]"}`} />
            {!collapsed && label}
          </a>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const page = usePage<Shared>();
  const currentUser = (page.props as Shared).currentUser;
  const current = page.url.split("?")[0];
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userRow = (collapsed?: boolean, mobile?: boolean) => (
    <div className="mt-auto border-border border-t pt-3">
      <a href={currentUser ? `/users/${currentUser.login}` : "/users/login"} title={collapsed ? (currentUser?.login ?? "Log in") : undefined}
        className={`flex items-center font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground hover:no-underline active:bg-muted ${
          mobile ? "gap-3.5 rounded-xl px-4 py-3 text-[15px]" : `gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${collapsed ? "justify-center" : ""}`
        }`}>
        <UserIcon className={`shrink-0 ${mobile ? "size-[22px]" : "size-[18px]"}`} />
        {!collapsed && (currentUser ? currentUser.login : "Log in")}
      </a>
    </div>
  );

  return (
    <div className="min-h-svh bg-background text-foreground md:flex">
      {/* desktop sidebar */}
      <aside className={`sticky top-0 hidden h-svh shrink-0 flex-col border-border border-r bg-sidebar p-3 md:flex ${collapsed ? "w-16" : "w-60"}`}>
        <div className={`mb-4 flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
          <a href="/" className="flex min-w-0 items-center gap-2 font-semibold hover:no-underline">
            <img src="/images/ao3_logos/logo.png" alt="AO3" className="h-8 w-auto shrink-0 object-contain" />
            {!collapsed && <span className="truncate text-[15px] leading-tight">Archive of Our Own</span>}
          </a>
          <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? "" : "ml-auto"}`}>
            {collapsed ? <PanelLeftIcon className="size-4" /> : <PanelLeftCloseIcon className="size-4" />}
          </button>
        </div>
        <NavItems current={current} collapsed={collapsed} />
        {userRow(collapsed)}
      </aside>

      {/* mobile top bar: logo left, hamburger right, no wordmark */}
      <header className="sticky top-0 z-40 flex items-center border-border border-b bg-sidebar px-4 py-2 md:hidden">
        <a href="/" className="hover:no-underline"><img src="/images/ao3_logos/logo.png" alt="Archive of Our Own" className="h-8 w-auto object-contain" /></a>
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}
          className="ml-auto grid size-9 place-items-center rounded-md hover:bg-muted"><MenuIcon className="size-5" /></button>
      </header>

      <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
          <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[18rem] flex-col border-border border-l bg-sidebar p-4 outline-none md:hidden">
            <a href="/" onClick={() => setOpen(false)} className="mb-4 flex items-center gap-2.5 px-1 font-semibold hover:no-underline">
              <img src="/images/ao3_logos/logo.png" alt="AO3" className="h-9 w-auto object-contain" />
              <span className="text-base">Archive of Our Own</span>
            </a>
            <NavItems current={current} mobile onNavigate={() => setOpen(false)} />
            {userRow(false, true)}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
