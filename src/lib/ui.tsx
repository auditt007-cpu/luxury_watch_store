"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type UIValue = {
  matchOpen: boolean;
  likesOpen: boolean;
  wechatOpen: boolean;
  wechatNote: string;
  toast: string;
  openMatch: () => void;
  closeMatch: () => void;
  openLikes: () => void;
  closeLikes: () => void;
  openWechat: (note?: string) => void;
  closeWechat: () => void;
  showToast: (message: string) => void;
};

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [matchOpen, setMatchOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [wechatNote, setWechatNote] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const value = useMemo<UIValue>(
    () => ({
      matchOpen,
      likesOpen,
      wechatOpen,
      wechatNote,
      toast,
      openMatch: () => setMatchOpen(true),
      closeMatch: () => setMatchOpen(false),
      openLikes: () => setLikesOpen(true),
      closeLikes: () => setLikesOpen(false),
      openWechat: (note = "") => {
        setWechatNote(note);
        setWechatOpen(true);
      },
      closeWechat: () => setWechatOpen(false),
      showToast,
    }),
    [likesOpen, matchOpen, showToast, toast, wechatNote, wechatOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
