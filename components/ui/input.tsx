import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground text-primary dark:bg-zinc-900 bg-page h-11 w-full min-w-0 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-base shadow-[var(--shadow-xs)] transition-all duration-normal ease-out-expo outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-zinc-400 dark:hover:border-zinc-600",
        "focus-visible:border-[var(--color-brand-500)] focus-visible:ring-4 focus-visible:ring-amber-500/15",
        "aria-invalid:ring-[var(--color-error)]/20 dark:aria-invalid:ring-[var(--color-error)]/40 aria-invalid:border-[var(--color-error)]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
