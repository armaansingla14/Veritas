"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "./LanguageSelector";

export function Providers({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
