"use client";

import { useCallback, useRef, useState } from "react";

// ============================================================
// Guard against double submits and button mashing.
//
// run(key, fn) runs fn unless an action with the same key is still in
// flight, and keeps the key busy for at least MIN_ACTION_MS even when
// fn finishes sooner, so repeated clicks are ignored and the spinner is
// visible long enough to read. Keys let independent actions (one row's
// toggle vs another's) run side by side.
//
// This only protects the UI. The real protection is server-side: admin
// routes require a session, and login / contact are throttled per IP.
// ============================================================

export const MIN_ACTION_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useBusy() {
  // The ref is the guard: it updates synchronously, so a second click in
  // the same frame is rejected before React has re-rendered.
  const running = useRef(new Set<string>());
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());

  const run = useCallback(async <T,>(key: string, fn: () => Promise<T>): Promise<T | undefined> => {
    if (running.current.has(key)) return undefined;
    running.current.add(key);
    setBusyKeys(new Set(running.current));
    const started = Date.now();
    try {
      return await fn();
    } finally {
      const rest = MIN_ACTION_MS - (Date.now() - started);
      if (rest > 0) await sleep(rest);
      running.current.delete(key);
      setBusyKeys(new Set(running.current));
    }
  }, []);

  const isBusy = useCallback((key: string) => busyKeys.has(key), [busyKeys]);

  return { run, isBusy, anyBusy: busyKeys.size > 0 };
}
