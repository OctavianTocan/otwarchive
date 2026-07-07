import type { ReactNode } from "react";
import AppShell from "../AppShell";

const frameClasses = {
  narrow: "mx-auto max-w-[900px] px-4 pt-6 pb-16 md:px-5",
  wide: "mx-auto max-w-[1180px] px-4 pt-6 pb-16 md:px-5",
  withSidebar:
    "mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-4 pt-6 pb-16 md:grid-cols-[290px_1fr] md:gap-7 md:px-5",
} as const;

type PageFrameVariant = keyof typeof frameClasses;

type PageFrameProps = {
  readonly children: ReactNode;
  readonly variant?: PageFrameVariant;
  readonly after?: ReactNode;
};

export function PageFrame({ children, variant = "wide", after }: PageFrameProps) {
  return (
    <AppShell>
      <main className={frameClasses[variant]}>{children}</main>
      {after}
    </AppShell>
  );
}
