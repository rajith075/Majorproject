"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { FirebaseProvider } from "./firebase-provider";
import { Toaster } from "sonner";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <QueryProvider>
      <FirebaseProvider>
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </FirebaseProvider>
    </QueryProvider>
  );
}
