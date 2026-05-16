"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "bys.apiKey";
const LOCAL_KEY = "bys.apiKey";
const REMEMBER_KEY = "bys.rememberKey";

type Props = {
  value: string;
  onChange: (key: string) => void;
};

export function ApiKeyInput({ value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const rememberFlag = localStorage.getItem(REMEMBER_KEY) === "1";
    setRemember(rememberFlag);
    const stored = rememberFlag
      ? localStorage.getItem(LOCAL_KEY)
      : sessionStorage.getItem(SESSION_KEY);
    if (stored) onChange(stored);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (remember) {
      localStorage.setItem(LOCAL_KEY, value);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, value);
      localStorage.removeItem(LOCAL_KEY);
    }
  }, [value, remember, hydrated]);

  function handleRememberChange(next: boolean) {
    setRemember(next);
    localStorage.setItem(REMEMBER_KEY, next ? "1" : "0");
  }

  function handleClear() {
    onChange("");
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCAL_KEY);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <label
          htmlFor="api-key"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Anthropic API key
        </label>
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Get a key →
        </a>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          id="api-key"
          type={show ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {show ? "Hide" : "Show"}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Clear
          </button>
        )}
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => handleRememberChange(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Remember on this device. Off (default) keeps the key only for this
          tab (sessionStorage); on persists it in localStorage. The key is sent
          directly to Anthropic and never stored on the server.
        </span>
      </label>
    </div>
  );
}
