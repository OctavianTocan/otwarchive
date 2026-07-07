import { UserIcon } from "lucide-react";
import type { CurrentUser } from "./types";

type UserRowProps = {
  readonly currentUser: CurrentUser;
  readonly collapsed?: boolean;
  readonly mobile?: boolean;
};

export function UserRow({ currentUser, collapsed, mobile }: UserRowProps) {
  return (
    <div className="mt-auto border-border border-t pt-3">
      <a
        className={`flex items-center font-medium text-foreground/70 transition-[background-color,color] duration-150 ease-out hover:bg-muted hover:text-foreground hover:no-underline active:bg-muted ${
          mobile
            ? "min-h-10 gap-3.5 rounded-xl px-4 py-3 text-[15px]"
            : `min-h-9 gap-2.5 rounded-md px-2 py-1.5 text-[13px] ${collapsed ? "justify-center" : ""}`
        }`}
        href={currentUser ? `/users/${currentUser.login}` : "/users/login"}
        title={collapsed ? (currentUser?.login ?? "Log in") : undefined}
      >
        <UserIcon className={`shrink-0 ${mobile ? "size-[22px]" : "size-[18px]"}`} />
        {!collapsed && (currentUser ? currentUser.login : "Log in")}
      </a>
    </div>
  );
}
