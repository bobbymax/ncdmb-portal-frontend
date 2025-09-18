import { PointerThreadConversationProps } from "@/app/Repositories/DocumentCategory/data";
import { echo, refreshEchoAuth } from "@/lib/echo";
import { useEffect, useRef, useState } from "react";
import TokenProvider from "@/lib/TokenProvider";

const useConversationSocket = (threadId: number) => {
  const [conversations, setConversations] = useState<
    PointerThreadConversationProps[]
  >([]);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof echo.private> | null>(null);

  // Fetch chat token when component mounts or when needed
  const fetchChatToken = async () => {
    if (isTokenLoading) return;

    setIsTokenLoading(true);
    try {
      const token = await TokenProvider.getInstance().fetchChatToken();
      setChatToken(token);

      // Refresh Echo authentication with new token
      if (token) {
        refreshEchoAuth();
      }
    } catch (error) {
      console.error("Failed to fetch chat token:", error);
      setChatToken(null);
    } finally {
      setIsTokenLoading(false);
    }
  };

  // Initialize chat token and WebSocket connection
  useEffect(() => {
    const initializeChat = async () => {
      // Check if we have a valid token
      if (!TokenProvider.getInstance().hasToken()) {
        await fetchChatToken();
      } else {
        setChatToken(TokenProvider.getInstance().getToken());
      }
    };

    initializeChat();
  }, []);

  // Set up WebSocket connection when token is available
  useEffect(() => {
    if (!chatToken) return;

    const channel = echo.private(`thread.${threadId}`);
    channelRef.current = channel;

    channel.listen(
      ".MessageSent",
      (payload: PointerThreadConversationProps) => {
        setConversations((prev) => {
          if (prev.some((conversation) => conversation.id === payload.id)) {
            return prev;
          }
          return [payload, ...prev];
        });
      }
    );

    return () => {
      channel.stopListening(".MessageSent");
      echo.leaveChannel(`private-conversations.${threadId}`);
    };
  }, [threadId, chatToken]);

  async function send(body: string, attachments?: unknown) {
    // Check if we have a valid token
    if (!chatToken || !TokenProvider.getInstance().isTokenValid()) {
      console.error("No valid chat token available");
      return null;
    }

    // optimistic
    const temp: PointerThreadConversationProps = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      sender_id: 0, // set to currentUser.id if you keep it in state
      message: body,
      type: "comment",
      created_at: new Date().toISOString(),
      user: {
        id: 0,
        name: "",
        email: "",
        avatar: "",
      },
      category: "commented",
      is_pinned: false,
      is_deleted: false,
      delivered: false,
      marked_as_read: false,
    };

    setConversations((m) => [temp, ...m]);

    try {
      const res = await fetch(`/api/threads/${threadId}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatToken}`,
        },
        body: JSON.stringify({ body, attachments }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired, try to refresh
          await fetchChatToken();
          const refreshedToken = TokenProvider.getInstance().getToken();
          if (refreshedToken) {
            // Retry with new token
            const retryRes = await fetch(
              `/api/threads/${threadId}/conversations`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${refreshedToken}`,
                },
                body: JSON.stringify({ body, attachments }),
              }
            );

            if (retryRes.ok) {
              const saved: PointerThreadConversationProps =
                await retryRes.json();
              setConversations((m) => [
                saved,
                ...m.filter((x) => x.id !== temp.id),
              ]);
              return saved;
            }
          }
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const saved: PointerThreadConversationProps = await res.json();

      // reconcile optimistic id
      setConversations((m) => [saved, ...m.filter((x) => x.id !== temp.id)]);
      return saved;
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setConversations((m) => m.filter((x) => x.id !== temp.id));
      return null;
    }
  }

  return {
    conversations,
    setConversations,
    send,
    chatToken,
    isTokenLoading,
    fetchChatToken,
  };
};

export default useConversationSocket;
