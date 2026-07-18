"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SmartSearch } from "@/app/components/search/SmartSearch";

const SearchContext = createContext<{ open: () => void }>({ open: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <SmartSearch open={isOpen} onClose={() => setIsOpen(false)} />
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
