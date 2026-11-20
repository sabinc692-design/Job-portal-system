"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "cn";

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be in DropdownMenu");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<HTMLElement> }>, {
      onClick: handleClick,
      ref: context.triggerRef as React.Ref<HTMLElement>,
    });
  }

  return (
    <button
      type="button"
      ref={context.triggerRef as React.Ref<HTMLButtonElement>}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left?: number; right?: number } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!context?.open || !context.triggerRef.current) return;

    const rect = context.triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // Check if dropdown goes below viewport
    const estimatedHeight = 220;
    const openUpward = rect.bottom + estimatedHeight > window.innerHeight && rect.top > estimatedHeight;
    const top = openUpward ? rect.top + scrollY - estimatedHeight - 4 : rect.bottom + scrollY + 6;

    if (align === "end") {
      setPos({ top, right: Math.max(12, window.innerWidth - rect.right - scrollX) });
    } else if (align === "start") {
      setPos({ top, left: Math.max(12, rect.left + scrollX) });
    } else {
      setPos({ top, left: rect.left + scrollX + rect.width / 2 });
    }
  }, [context?.open, align]);

  if (!context?.open || !mounted || !pos) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: pos.top,
    zIndex: 9999,
    ...(pos.right !== undefined ? { right: pos.right } : {}),
    ...(pos.left !== undefined ? { left: pos.left, transform: align === "center" ? "translateX(-50%)" : undefined } : {}),
  };

  return createPortal(
    <div
      ref={context.contentRef}
      style={style}
      className={cn(
        "min-w-[13rem] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-1.5 shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  destructive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { destructive?: boolean }) {
  const context = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        destructive && "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-neutral-100 dark:bg-neutral-800", className)} />
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider", className)}>
      {children}
    </div>
  );
}
