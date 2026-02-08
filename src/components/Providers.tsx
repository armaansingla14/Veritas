"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "./LanguageSelector";
import { ErrorBoundary } from "./ErrorBoundary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>{children}</LanguageProvider>
    </ErrorBoundary>
  );
}
