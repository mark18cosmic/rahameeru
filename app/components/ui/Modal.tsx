"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${maxWidth} rounded-3xl bg-white dark:bg-ink-900 shadow-card p-6`}
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            {title && (
              <h3 className="mb-4 pr-8 text-xl font-bold text-ink-900 dark:text-white">
                {title}
              </h3>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
