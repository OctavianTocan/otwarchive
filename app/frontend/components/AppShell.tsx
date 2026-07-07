import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { DesktopSidebar } from "./app-shell/DesktopSidebar";
import { Footer } from "./app-shell/Footer";
import { MobileNavigation } from "./app-shell/MobileNavigation";
import type { CurrentUser } from "./app-shell/types";

type Shared = {
  readonly currentUser?: CurrentUser;
};

export default function AppShell({ children }: { readonly children: ReactNode }) {
  const page = usePage<Shared>();
  const current = page.url.split("?").at(0) ?? "/";
  const currentUser: CurrentUser = page.props.currentUser ?? null;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground md:flex">
      <DesktopSidebar current={current} currentUser={currentUser} />
      <MobileNavigation current={current} currentUser={currentUser} />

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="min-w-0 flex-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
