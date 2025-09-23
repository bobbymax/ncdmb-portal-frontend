import { PointerThreadConversationProps } from "../../app/Repositories/DocumentCategory/data";
import { ThreadResponseData } from "../../app/Repositories/Thread/data";
import { echo, refreshEchoAuth } from "../../lib/echo";
import { useEffect, useRef, useState } from "react";
import TokenProvider from "../../lib/TokenProvider";
import { ApiService } from "../../app/Services/ApiService";

interface UseConversationSocketProps {
  threadId: number;
  threadData?: ThreadResponseData;
  isThreadInDatabase?: boolean;
  selectedCategory?: string;
  onThreadCreated?: () => void;
  onThreadUpdated?: (updatedThread: ThreadResponseData) => void;
  globalThreads?: ThreadResponseData[];
  selectedChatId?: string;
  documentData?: {
    id: number;
    user_id: number;
    created_by: number;
    pointer: string;
  };
  loggedInUser?: {
    id: number;
    name?: string;
    email?: string;
    groups?: Array<{ id: number }>;
  };
  trackers?: Array<{
    identifier: string;
    user_id: number;
    group_id: number;
  }>;
}

const useConversationSocket = ({
  threadId,
  threadData,
  isThreadInDatabase = false,
  selectedCategory,
  onThreadCreated,
  onThreadUpdated,
  globalThreads = [],
  selectedChatId,
  documentData,
  loggedInUser,
  trackers = [],
}: UseConversationSocketProps) => {
  const [conversations, setConversations] = useState<
    PointerThreadConversationProps[]
  >([]);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof echo.private> | null>(null);
  const apiService = useRef(new ApiService());

  // Helper function to determine thread owner and recipient when thread doesn't exist in backend
  const determineThreadOwnerAndRecipient = () => {
    if (!documentData || !loggedInUser) return null;

    const { user_id, created_by, pointer } = documentData;
    const loggedInUserId = loggedInUser.id;

    // Find the current tracker based on pointer
    const currentTracker = trackers.find(
      (tracker) => tracker.identifier === pointer
    );
    if (!currentTracker) return null;

    let recipientId: number;
    let threadOwnerId: number;

    // If logged-in user is the document owner but NOT the creator
    if (loggedInUserId === user_id && loggedInUserId !== created_by) {
      threadOwnerId = user_id; // Document owner as thread owner
      recipientId = created_by || 0; // Creator as recipient
    }
    // If logged-in user is neither owner nor creator
    else if (loggedInUserId !== user_id && loggedInUserId !== created_by) {
      // Check if user has permission through tracker
      const hasDirectPermission = currentTracker.user_id === loggedInUserId;
      const hasGroupPermission =
        currentTracker.user_id === 0 &&
        loggedInUser.groups?.some(
          (group) => group.id === currentTracker.group_id
        );

      if (hasDirectPermission || hasGroupPermission) {
        threadOwnerId = loggedInUserId; // Logged-in user as thread owner
        recipientId = user_id || 0;
      } else {
        return null; // User has no permission
      }
    } else {
      return null; // Logged-in user is the creator - cannot create threads
    }

    return {
      threadOwnerId,
      recipientId,
      pointerIdentifier: currentTracker.identifier,
    };
  };

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
      // Failed to fetch chat token
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

  // Initialize conversations with existing thread data when threadData changes
  useEffect(() => {
    if (threadData && threadData.conversations) {
      // Sort conversations by created_at in ascending order (oldest first)
      const sortedConversations = [...threadData.conversations].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setConversations(sortedConversations);
    }
  }, [threadData]);

  // Set up WebSocket connection when token is available
  useEffect(() => {
    if (!chatToken) {
      return;
    }

    const channel = echo.private(`private-conversations.${threadId}`);
    channelRef.current = channel;

    channel.listen(
      ".MessageSent",
      (payload: PointerThreadConversationProps) => {
        // Ensure the payload has the correct structure
        const normalizedPayload = {
          ...payload,
          user: payload.user || {
            id: 0,
            name: "Unknown User",
            email: "",
            avatar: "",
          },
        };

        setConversations((prev) => {
          if (
            prev.some(
              (conversation) => conversation.id === normalizedPayload.id
            )
          ) {
            return prev;
          }
          // Add new message and sort by created_at
          const updatedConversations = [...prev, normalizedPayload].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          return updatedConversations;
        });
      }
    );

    return () => {
      channel.stopListening(".MessageSent");
      echo.leaveChannel(`private-conversations.${threadId}`);
    };
  }, [threadId, chatToken]);

  async function send(documentId: number, body: string, attachments?: unknown) {
    // Check if we have a valid token
    if (!chatToken || !TokenProvider.getInstance().isTokenValid()) {
      // No valid chat token available
      return null;
    }

    // optimistic
    const temp: PointerThreadConversationProps = {
      id: crypto.randomUUID(),
      document_id: documentId,
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

    setConversations((m) => {
      const updatedConversations = [...m, temp].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updatedConversations;
    });

    try {
      let response: any;

      // Single source of truth: Check global state for thread existence
      const existingThread = globalThreads.find(
        (thread) => thread.identifier === selectedChatId
      );

      if (existingThread) {
        // Thread exists in global state
        if (isThreadInDatabase) {
          // Thread is also in database → Use existing thread endpoint
          const existingThreadData = {
            thread_id: existingThread.id,
            document_id: documentId,
            message: body,
            category: selectedCategory || existingThread.category,
            attachments,
          };

          response =
            await apiService.current.request<PointerThreadConversationProps>({
              method: "POST",
              url: `api/threads/${existingThread.id}/conversations`,
              headers: { Authorization: `Bearer ${chatToken}` },
              data: existingThreadData,
            });
        } else {
          // Thread exists locally but not in database → Create and send
          const createThreadData = {
            thread_owner_id: existingThread.thread_owner_id,
            recipient_id: existingThread.recipient_id,
            document_id: documentId,
            identifier: existingThread.identifier,
            pointer_identifier: existingThread.pointer_identifier,
            category: selectedCategory || existingThread.category,
            message: body,
            attachments,
          };

          response =
            await apiService.current.request<PointerThreadConversationProps>({
              method: "POST",
              url: "api/threads/create-and-message",
              headers: { Authorization: `Bearer ${chatToken}` },
              data: createThreadData,
            });

          // Mark thread as created in database
          if (response.status === 200 && onThreadCreated) {
            onThreadCreated();
          }
        }
      } else {
        // Thread doesn't exist in backend → Generate thread owner/recipient and create thread

        const threadInfo = determineThreadOwnerAndRecipient();
        if (!threadInfo) {
          throw new Error(
            "Cannot determine thread owner/recipient - user may not have permission"
          );
        }

        const { threadOwnerId, recipientId, pointerIdentifier } = threadInfo;

        // Generate thread identifier
        const threadIdentifier = `thread_${threadOwnerId}_${recipientId}_${pointerIdentifier}_${Date.now()}`;

        const createThreadData = {
          thread_owner_id: threadOwnerId,
          recipient_id: recipientId,
          document_id: documentId,
          identifier: threadIdentifier,
          pointer_identifier: pointerIdentifier,
          category: selectedCategory || "question",
          message: body,
          attachments,
        };

        response =
          await apiService.current.request<PointerThreadConversationProps>({
            method: "POST",
            url: "api/threads/create-and-message",
            headers: { Authorization: `Bearer ${chatToken}` },
            data: createThreadData,
          });

        // Mark thread as created in database
        if (response.status === 200 && onThreadCreated) {
          onThreadCreated();
        }
      }

      if (response.status === 401) {
        // Token expired, try to refresh
        await fetchChatToken();
        const refreshedToken = TokenProvider.getInstance().getToken();
        if (refreshedToken) {
          // Retry with new token
          if (!isThreadInDatabase && threadData) {
            const retryCreateThreadData = {
              thread_owner_id: threadData.thread_owner_id,
              recipient_id: threadData.recipient_id,
              document_id: documentId,
              identifier: threadData.identifier,
              pointer_identifier: threadData.pointer_identifier,
              category: selectedCategory || threadData.category,
              message: body,
              attachments,
            };

            response =
              await apiService.current.request<PointerThreadConversationProps>({
                method: "POST",
                url: "api/threads/create-and-message",
                headers: {
                  Authorization: `Bearer ${refreshedToken}`,
                },
                data: retryCreateThreadData,
              });
          } else {
            const retryExistingThreadData = {
              thread_id: existingThread?.id,
              document_id: documentId,
              message: body,
              category: selectedCategory || existingThread?.category,
              attachments,
            };

            response =
              await apiService.current.request<PointerThreadConversationProps>({
                method: "POST",
                url: `api/threads/${existingThread?.id}/conversations`,
                headers: {
                  Authorization: `Bearer ${refreshedToken}`,
                },
                data: retryExistingThreadData,
              });
          }

          if (response.status === 200) {
            const responseData = response.data;

            // Check if response is ThreadResponseData (for existing threads) or PointerThreadConversationProps (for new threads)
            if (
              responseData &&
              "conversations" in responseData &&
              Array.isArray(responseData.conversations)
            ) {
              // Response is ThreadResponseData - update global thread state and local conversations
              const updatedThread: ThreadResponseData = responseData;

              // Update global thread state
              if (onThreadUpdated) {
                onThreadUpdated(updatedThread);
              }

              // Update local conversations with the latest conversations from the thread
              const sortedConversations = [...updatedThread.conversations].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );

              setConversations(sortedConversations);

              return updatedThread;
            } else {
              // Response is PointerThreadConversationProps - handle as single conversation
              const saved: PointerThreadConversationProps = responseData;
              setConversations((m) => {
                const filteredMessages = m.filter((x) => x.id !== temp.id);
                const updatedConversations = [...filteredMessages, saved].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                );
                return updatedConversations;
              });
              return saved;
            }
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = response.data?.data;

      // Check if response is ThreadResponseData (for existing threads) or PointerThreadConversationProps (for new threads)
      if (
        responseData &&
        "conversations" in responseData &&
        Array.isArray(responseData.conversations)
      ) {
        // Response is ThreadResponseData - update global thread state and local conversations
        const updatedThread: ThreadResponseData = responseData;

        // Update global thread state
        if (onThreadUpdated) {
          onThreadUpdated(updatedThread);
        }

        // Update local conversations with the latest conversations from the thread
        const sortedConversations = [...updatedThread.conversations].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setConversations(sortedConversations);

        return updatedThread;
      } else {
        // Response is PointerThreadConversationProps - handle as single conversation
        const saved: PointerThreadConversationProps = responseData;

        // reconcile optimistic id
        setConversations((m) => {
          const filteredMessages = m.filter((x) => x.id !== temp.id);
          const updatedConversations = [...filteredMessages, saved].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          return updatedConversations;
        });
        return saved;
      }
    } catch (error) {
      // Failed to send message
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
