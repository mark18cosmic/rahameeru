"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "rahameeru.bill";
const EVENT = "bill-changed";

/** Rates used for the estimate. Both are printed on the sheet, not hidden. */
export const GST_RATE = 0.08;
export const SERVICE_RATE = 0.1;

export type BillItem = {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  dish: string;
  price: number;
  qty: number;
};

function read(): BillItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(next: BillItem[]) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

const idOf = (i: Pick<BillItem, "restaurantId" | "dish">) =>
  `${i.restaurantId}::${i.dish.toLowerCase()}`;

/**
 * A running bill, not a shopping cart.
 *
 * Nothing here orders anything — the app has no ordering integration and
 * shouldn't pretend to. What people actually want before they leave the house
 * is "what will this come to", so this collects dishes off menus and works out
 * the total with service and GST, and what that is each once you say how many
 * of you there are.
 *
 * Local storage only: it's a scratchpad for one evening, not something worth an
 * account or a sync.
 */
export function useCart() {
  const [items, setItems] = useState<BillItem[]>([]);
  const [people, setPeople] = useState(2);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const add = useCallback((item: Omit<BillItem, "qty">, qty = 1) => {
    const current = read();
    const key = idOf(item);
    const found = current.find((i) => idOf(i) === key);
    write(
      found
        ? current.map((i) => (idOf(i) === key ? { ...i, qty: i.qty + qty } : i))
        : [...current, { ...item, qty }]
    );
  }, []);

  const setQty = useCallback((item: Pick<BillItem, "restaurantId" | "dish">, qty: number) => {
    const key = idOf(item);
    const current = read();
    write(
      qty <= 0
        ? current.filter((i) => idOf(i) !== key)
        : current.map((i) => (idOf(i) === key ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => write([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    const service = subtotal * SERVICE_RATE;
    const gst = (subtotal + service) * GST_RATE;
    const total = subtotal + service + gst;
    return {
      subtotal,
      service,
      gst,
      total,
      perHead: people > 0 ? total / people : total,
    };
  }, [items, people]);

  const count = items.reduce((n, i) => n + i.qty, 0);

  return { items, add, setQty, clear, totals, count, people, setPeople };
}
