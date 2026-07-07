import { Link } from "@inertiajs/react";
import {
  BookOpenIcon,
  BookmarkIcon,
  FolderIcon,
  HomeIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react";

const NAV = [
  { label: "Home", href: "/", Icon: HomeIcon, inertia: false },
  { label: "Works", href: "/works", Icon: BookOpenIcon, inertia: true },
  { label: "Bookmarks", href: "/bookmarks", Icon: BookmarkIcon, inertia: false },
  { label: "Collections", href: "/collections", Icon: FolderIcon, inertia: false },
  { label: "Tags", href: "/media", Icon: TagIcon, inertia: false },
  { label: "Search", href: "/works/search", Icon: SearchIcon, inertia: true },
] as const;

type NavItemsProps = {
  readonly current: string;
  readonly collapsed?: boolean;
  readonly mobile?: boolean;
  readonly onNavigate?: () => void;
};

export function NavItems({ current, collapsed, mobile, onNavigate }: NavItemsProps) {
  return (
    <nav className={`flex flex-col ${mobile ? "gap-1.5" : "gap-0.5"}`}>
      {NAV.map(({ label, href, Icon, inertia }) => {
        const active = href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
        const className = `flex items-center font-medium transition-[background-color,color] duration-150 ease-out hover:no-underline ${
          mobile
            ? "min-h-10 gap-3.5 rounded-xl px-4 py-3 text-[15px]"
            : `min-h-9 gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${collapsed ? "justify-center" : ""}`
        } ${active ? "bg-accent text-accent-foreground shadow-sm" : "text-foreground/70 hover:bg-muted hover:text-foreground active:bg-muted"}`;
        const content = (
          <>
            <Icon className={`shrink-0 ${mobile ? "size-[22px]" : "size-[18px]"}`} />
            {!collapsed && label}
          </>
        );

        if (inertia) {
          if (onNavigate) {
            return (
              <Link
                key={href}
                cacheFor="30s"
                className={className}
                href={href}
                onClick={onNavigate}
                prefetch="hover"
                title={collapsed ? label : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <Link
              key={href}
              cacheFor="30s"
              className={className}
              href={href}
              prefetch="hover"
              title={collapsed ? label : undefined}
            >
              {content}
            </Link>
          );
        }

        if (onNavigate) {
          return (
            <a
              key={href}
              className={className}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
            >
              {content}
            </a>
          );
        }

        return <a key={href} className={className} href={href} title={collapsed ? label : undefined}>{content}</a>;
      })}
    </nav>
  );
}
