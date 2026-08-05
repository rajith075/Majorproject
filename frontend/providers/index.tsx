"use client";
import { toast } from "sonner";

import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}