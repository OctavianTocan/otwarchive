import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";

const NAV = [
  { label: "Works", href: "/works" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Collections", href: "/collections" },
  { label: "Tags", href: "/media" },
  { label: "Search", href: "/works/search" },
];

type Shared = { currentUser?: { id: number; login: string } | null };

/** Responsive top navigation bar shared across all React pages. */
export default function AppShellHeader() {
  const { currentUser } = usePage<Shared>().props as Shared;
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-brand text-brand-foreground">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-3 md:px-5">
        <a href="/" className="font-bold text-lg hover:no-underline">Archive of Our Own</a>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}
               className="rounded-md px-2.5 py-1 font-medium text-sm text-primary-foreground/90 hover:bg-white/15 hover:text-primary-foreground hover:no-underline">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {currentUser ? (
            <a href={`/users/${currentUser.login}`} className="hidden font-medium text-primary-foreground text-sm hover:no-underline sm:inline">{currentUser.login}</a>
          ) : (
            <a href="/users/login" className="hidden font-medium text-primary-foreground text-sm hover:no-underline sm:inline">Log in</a>
          )}
          <button type="button" aria-label="Menu" onClick={() => setOpen((o) => !o)}
                  className="inline-flex size-8 items-center justify-center rounded-md hover:bg-white/15 md:hidden">
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-white/15 border-t px-4 pb-3 md:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="block rounded-md px-2 py-2 font-medium text-primary-foreground/90 text-sm hover:bg-white/15 hover:no-underline">{n.label}</a>
          ))}
          <a href={currentUser ? `/users/${currentUser.login}` : "/users/login"} className="block rounded-md px-2 py-2 font-medium text-primary-foreground text-sm hover:bg-white/15 hover:no-underline sm:hidden">
            {currentUser ? currentUser.login : "Log in"}
          </a>
        </nav>
      )}
    </header>
  );
}
