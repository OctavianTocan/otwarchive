"use client";

import type * as React from "react";

import { cn } from "../../lib/utils";

/** Form label element that supports `htmlFor` to associate with a control. */
function Label({ className, children, htmlFor, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "flex select-none items-center gap-1.5 font-medium text-sm leading-none",
        className,
      )}
      data-slot="label"
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
}

export { Label };
