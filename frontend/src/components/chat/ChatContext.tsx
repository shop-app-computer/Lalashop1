import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchConversations,
  fetchUnreadSummary,
  sendMessage,
  startConversation,
  type ChatConversation,
  type ChatPeer,
  type ProductContext,
} from "@/services/messagesApi";

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  openWithPeer: (peer: ChatPeer) => Promise<void>;
  openWithProduct: (peer: ChatPeer, product: ProductContext) => Promise<void>;
  refreshConversations: () => Promise<void>;
  unreadMessages: number;
  unreadNotifications: number;
  unreadTotal: number;
  refreshUnread: () => Promise<void>;
  isAuthed: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const POLL_MS = 25000;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect auth state from localStorage. We re-check whenever the panel is
  // opened so a user logging in mid-session works without a full reload.
  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return false;
    const t = window.localStorage.getItem("token");
    const ok = !!t && t !== "null" && t !== "undefined";
    setIsAuthed(ok);
    return ok;
  }, []);

  useEffect(() => {
    checkAuth();
    const onStorage = () => checkAuth();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [checkAuth]);

  const refreshConversations = useCallback(async () => {
    if (!checkAuth()) return;
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch {
      // ignore — surfaces empty state
    }
  }, [checkAuth]);

  const refreshUnread = useCallback(async () => {
    if (!checkAuth()) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return;
    }
    try {
      const summary = await fetchUnreadSummary();
      setUnreadMessages(summary.messages);
      setUnreadNotifications(summary.notifications);
    } catch {
      // ignore
    }
  }, [checkAuth]);

  // Poll unread summary so the Globe badge stays accurate without sockets.
  useEffect(() => {
    if (!isAuthed) return;
    void refreshUnread();
    pollTimerRef.current = setInterval(() => void refreshUnread(), POLL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isAuthed, refreshUnread]);

  const open = useCallback(() => {
    if (!checkAuth()) return;
    setIsOpen(true);
    void refreshConversations();
  }, [checkAuth, refreshConversations]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) void refreshConversations();
      return next;
    });
  }, [refreshConversations]);

  const openWithPeer = useCallback(
    async (peer: ChatPeer) => {
      if (!checkAuth()) return;
      try {
        const conv = await startConversation(peer._id);
        if (!conv) return;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        setActiveConversationId(conv._id);
        setIsOpen(true);
      } catch {
        // ignore
      }
    },
    [checkAuth]
  );

  // Open the chat with `peer` and immediately send a product-context card so the
  // seller's inbox shows which product the buyer is asking about. This is what
  // the "Chat" button on a product page calls.
  const openWithProduct = useCallback(
    async (peer: ChatPeer, product: ProductContext) => {
      if (!checkAuth()) return;
      try {
        const conv = await startConversation(peer._id);
        if (!conv) return;
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          if (exists) return prev;
          return [conv, ...prev];
        });
        setActiveConversationId(conv._id);
        setIsOpen(true);
        await sendMessage(conv._id, {
          kind: "product",
          body: "",
          productContext: product,
        });
        await refreshConversations();
      } catch {
        // ignore
      }
    },
    [checkAuth, refreshConversations]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      conversations,
      activeConversationId,
      setActiveConversationId,
      openWithPeer,
      openWithProduct,
      refreshConversations,
      unreadMessages,
      unreadNotifications,
      unreadTotal: unreadMessages + unreadNotifications,
      refreshUnread,
      isAuthed,
    }),
    [
      isOpen, open, close, toggle, conversations, activeConversationId,
      openWithPeer, openWithProduct, refreshConversations, unreadMessages, unreadNotifications,
      refreshUnread, isAuthed,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
