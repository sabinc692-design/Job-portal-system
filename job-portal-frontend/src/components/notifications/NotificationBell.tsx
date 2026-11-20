"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, BriefcaseBusiness } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type NotificationResponse = { notifications: NotificationItem[]; unreadCount: number };

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);

    const refresh = async () => {
      try {
        const result = await apiGet<NotificationResponse>("/notifications");
        const nextItems = result.notifications ?? [];
        if (seenIds.current) {
          const fresh = nextItems.filter((item) => !seenIds.current!.has(item.id));
          if (permission === "granted") {
            fresh.forEach((item) => new Notification(item.title, { body: item.message, tag: item.id }));
          }
        }
        seenIds.current = new Set(nextItems.map((item) => item.id));
        setItems(nextItems.slice(0, 10));
        setUnreadCount(result.unreadCount ?? nextItems.filter((item) => !item.read).length);
      } catch {
        // Keep the header usable during brief network or API outages.
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(interval);
  }, [permission]);

  async function markRead(item: NotificationItem) {
    if (item.read) return;
    try {
      await apiPatch(`/notifications/${item.id}/read`);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch { /* Next poll will restore the server state. */ }
  }

  async function markAllRead() {
    try {
      await apiPatch("/notifications/read-all");
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch { /* Next poll will restore the server state. */ }
  }

  async function enableDesktopNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(await Notification.requestPermission());
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <button type="button" onClick={markAllRead} disabled={!unreadCount} className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-40 dark:hover:text-white">Mark all read</button>
        </div>
        {permission !== "granted" && <button type="button" onClick={enableDesktopNotifications} className="w-full border-b border-neutral-100 px-4 py-2 text-left text-[11px] text-blue-700 hover:bg-blue-50 dark:border-neutral-800 dark:text-blue-300 dark:hover:bg-neutral-800">{permission === "unsupported" ? "Desktop alerts are not supported in this browser." : "Enable desktop alerts for new notifications"}</button>}
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? <p className="px-4 py-8 text-center text-xs text-neutral-500">You’re all caught up.</p> : items.map((item) => <button type="button" key={item.id} onClick={() => void markRead(item)} className={`flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 ${item.read ? "opacity-65" : ""}`}>
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${item.type === "NEW_APPLICATION" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"}`}>
              {item.read ? <Check className="size-4" /> : <BriefcaseBusiness className="size-4" />}
            </span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</span><span className="mt-0.5 block text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{item.message}</span><span className="mt-1 block text-[10px] text-neutral-400">{new Date(item.createdAt).toLocaleString()}</span></span>
            {!item.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />}
          </button>)}
        </div>
      </div>}
    </div>
  );
}
