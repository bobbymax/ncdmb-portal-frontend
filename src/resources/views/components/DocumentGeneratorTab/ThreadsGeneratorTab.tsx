import React, { useState, useEffect, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import moment from "moment";
import { DataOptionsProps } from "../forms/MultiSelect";
import {
  DocumentCategoryResponseData,
  PointerActivityTypesProps,
} from "@/app/Repositories/DocumentCategory/data";
import { ThreadResponseData } from "@/app/Repositories/Thread/data";
import usePusherSocket from "../../../../features/chat/usePusherSocket";

type CommentType =
  | "comment"
  | "feedback"
  | "review"
  | "question"
  | "suggestion"
  | "query";

export type CommentProps = {
  id: string;
  text: string;
  author: DataOptionsProps | null;
  timestamp: string;
  type: CommentType;
  status: "pending" | "resolved" | "rejected";
  seen: number;
  liked: number;
};

interface CommentsGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

const ThreadsGeneratorTab: React.FC<CommentsGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const { staff } = useAuth();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("comment");
  const [selectedCategory, setSelectedCategory] =
    useState<PointerActivityTypesProps>("question");
  const [categoryUpdated, setCategoryUpdated] = useState(false);
  const [filterType, setFilterType] = useState<
    | "all"
    | "comment"
    | "feedback"
    | "review"
    | "question"
    | "suggestion"
    | "query"
  >("all");

  // Chat state
  const [activeTab, setActiveTab] = useState<"all" | PointerActivityTypesProps>(
    "all"
  );
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showChatView, setShowChatView] = useState(false);

  // WebSocket connection state
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);

  // Thread database status tracking
  const [threadDatabaseStatus, setThreadDatabaseStatus] = useState<
    Map<string, boolean>
  >(new Map());

  // Initialize thread database status with existing threads from backend
  useEffect(() => {
    if (state.threads && state.threads.length > 0) {
      const initialStatus = new Map<string, boolean>();
      state.threads.forEach((thread) => {
        initialStatus.set(thread.identifier, true);
      });
      setThreadDatabaseStatus(initialStatus);
    }
  }, [state.threads]);

  // Activity types for tabs
  const activityTypes: ("all" | PointerActivityTypesProps)[] = [
    "all",
    "queried",
    "escalated",
    "reviewed",
    "question",
  ];

  // Get all threads from state.threads (existing from document + generated for display)
  const allThreads = useMemo(() => {
    if (!state.existingDocument || !state.trackers || !state.loggedInUser) {
      return [];
    }

    const { user_id, created_by, pointer } = state.existingDocument;
    const loggedInUserId = state.loggedInUser.id;

    // Find the current tracker based on pointer
    const currentTracker = state.trackers.find(
      (tracker) => tracker.identifier === pointer
    );

    if (!currentTracker) return [];

    // Check permissions for non-owner/non-creator users
    if (loggedInUserId !== user_id && loggedInUserId !== created_by) {
      // Check if user has permission through tracker
      const hasDirectPermission = currentTracker.user_id === loggedInUserId;
      const hasGroupPermission =
        currentTracker.user_id === 0 &&
        state.loggedInUser.groups?.some(
          (group) => group.id === currentTracker.group_id
        );

      if (!hasDirectPermission && !hasGroupPermission) {
        // User has no permission - set access level to lock
        actions.setAccessLevel("lock");
        return [];
      }
    }

    // Start with existing threads from state.threads that match this pointer
    // These threads come from the existing document and are synced to global state
    const existingThreads = (state.threads || []).filter(
      (thread) => thread.pointer_identifier === currentTracker.identifier
    );
    const threads: ThreadResponseData[] = [...existingThreads];

    // Helper function to check if a thread already exists between two users
    const threadExists = (ownerId: number, recipientId: number): boolean => {
      return threads.some(
        (thread) =>
          thread.thread_owner_id === ownerId &&
          thread.recipient_id === recipientId &&
          thread.pointer_identifier === currentTracker.identifier
      );
    };

    // Generate threads for display (these will be saved to global state when needed)
    // If logged-in user is the owner but NOT the creator, they can create threads
    if (loggedInUserId === user_id && loggedInUserId !== created_by) {
      // Check if thread already exists between owner and creator
      if (!threadExists(user_id, created_by || 0)) {
        const thread: ThreadResponseData = {
          id: Date.now(), // Temporary ID for display threads
          pointer_identifier: currentTracker.identifier,
          recipient_id: created_by || 0,
          identifier: `thread_${user_id}_${created_by || 0}_${
            currentTracker.identifier
          }_${Date.now()}`,
          thread_owner_id: user_id, // Document owner as thread owner
          category: "question" as PointerActivityTypesProps,
          conversations: [],
          priority: "medium",
          status: "pending",
          state: "open",
          created_at: new Date().toISOString(),
        };

        threads.push(thread);
      }
    }
    // If logged-in user is neither owner nor creator, they can create threads
    else if (loggedInUserId !== user_id && loggedInUserId !== created_by) {
      // Check if user has permission through tracker
      const hasDirectPermission = currentTracker.user_id === loggedInUserId;
      const hasGroupPermission =
        currentTracker.user_id === 0 &&
        state.loggedInUser.groups?.some(
          (group) => group.id === currentTracker.group_id
        );

      if (hasDirectPermission || hasGroupPermission) {
        // If owner and creator are different, create separate threads for each
        if (user_id !== created_by) {
          // Thread with document owner
          if (!threadExists(loggedInUserId, user_id || 0)) {
            const thread: ThreadResponseData = {
              id: Date.now(), // Temporary ID for display threads
              pointer_identifier: currentTracker.identifier,
              recipient_id: user_id || 0,
              identifier: `thread_${loggedInUserId}_${user_id}_${
                currentTracker.identifier
              }_${Date.now()}`,
              thread_owner_id: loggedInUserId,
              category: "question" as PointerActivityTypesProps,
              conversations: [],
              priority: "medium",
              status: "pending",
              state: "open",
              created_at: new Date().toISOString(),
            };

            threads.push(thread);
          }

          // Thread with document creator
          if (created_by && !threadExists(loggedInUserId, created_by)) {
            const thread: ThreadResponseData = {
              id: Date.now(), // Temporary ID for display threads
              pointer_identifier: currentTracker.identifier,
              recipient_id: created_by,
              identifier: `thread_${loggedInUserId}_${created_by}_${
                currentTracker.identifier
              }_${Date.now()}`,
              thread_owner_id: loggedInUserId,
              category: "question" as PointerActivityTypesProps,
              conversations: [],
              priority: "medium",
              status: "pending",
              state: "open",
              created_at: new Date().toISOString(),
            };

            threads.push(thread);
          }
        } else {
          // Owner and creator are the same, create only one thread
          if (!threadExists(loggedInUserId, user_id || 0)) {
            const thread: ThreadResponseData = {
              id: Date.now(), // Temporary ID for display threads
              pointer_identifier: currentTracker.identifier,
              recipient_id: user_id || 0,
              identifier: `thread_${loggedInUserId}_${user_id}_${
                currentTracker.identifier
              }_${Date.now()}`,
              thread_owner_id: loggedInUserId,
              category: "question" as PointerActivityTypesProps,
              conversations: [],
              priority: "medium",
              status: "pending",
              state: "open",
              created_at: new Date().toISOString(),
            };

            threads.push(thread);
          }
        }
      }
    }

    return threads;
  }, [
    state.existingDocument,
    state.trackers,
    state.loggedInUser,
    state.threads,
    actions,
  ]);

  // Get current thread data for WebSocket - prioritize existing threads from backend
  const currentThreadData = useMemo(() => {
    if (!currentThreadId || !selectedChat) return undefined;

    // First check if thread exists in actual state.threads (from backend)
    const existingThread = (state.threads || []).find(
      (thread) => thread.identifier === selectedChat
    );
    if (existingThread) {
      return existingThread;
    }

    // Fallback to generated threads if not found in backend threads
    return allThreads.find((thread) => thread.identifier === selectedChat);
  }, [currentThreadId, selectedChat, state.threads, allThreads]);

  // Initialize WebSocket connection when a chat is selected
  const {
    conversations: realtimeConversations,
    send: sendRealtimeMessage,
    chatToken,
    isTokenLoading,
    fetchChatToken,
    connectionState,
    reconnect,
  } = usePusherSocket({
    threadId: currentThreadId || 0,
    threadData: currentThreadData,
    isThreadInDatabase: threadDatabaseStatus.get(selectedChat || "") ?? false,
    selectedCategory: selectedCategory,
    globalThreads: state.threads || [], // Use actual backend threads, not generated ones
    selectedChatId: selectedChat || undefined,
    documentData: state.existingDocument
      ? {
          id: state.existingDocument.id,
          user_id: state.existingDocument.user_id || 0,
          created_by: state.existingDocument.created_by || 0,
          pointer: state.existingDocument.pointer || "",
        }
      : undefined,
    loggedInUser: state.loggedInUser,
    trackers: state.trackers || [],
    onThreadCreated: () => {
      if (selectedChat) {
        setThreadDatabaseStatus((prev) =>
          new Map(prev).set(selectedChat, true)
        );
      }
    },
    onThreadUpdated: (updatedThread: ThreadResponseData) => {
      // Update the global threads state with the updated thread
      const updatedThreads = (state.threads || []).map((thread) =>
        thread.identifier === updatedThread.identifier ? updatedThread : thread
      );
      actions.setThreads(updatedThreads);
    },
  });

  // Debug logging removed for production

  // Get category color function (shared utility)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "queried":
        return "#dc2626"; // Danger red
      case "escalated":
        return "#059669"; // Army green
      case "reviewed":
        return "#1e40af"; // Navy blue
      case "question":
        return "#ea580c"; // Orange
      default:
        return "#6b7280"; // Neutral grey
    }
  };

  // Convert threads to chat format
  const chatThreads = useMemo(() => {
    return allThreads.map((thread) => {
      // Determine the other person in the conversation (not the logged-in user)
      const loggedInUserId = state.loggedInUser?.id;
      const otherUserId =
        thread.thread_owner_id === loggedInUserId
          ? Number(thread.recipient_id) // If logged-in user is the thread owner, show recipient
          : thread.thread_owner_id; // If logged-in user is not the thread owner, show thread owner

      // Get user info for the other person in the conversation
      const otherUser = state.resources.users.find(
        (user) => user.id === otherUserId
      );

      // Get the last conversation from the thread owner to determine category
      const lastConversationFromOwner = thread.conversations
        .filter((conv) => conv.user.id === thread.thread_owner_id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

      // Use the shared getCategoryColor function

      // Use the last conversation's category, or fall back to thread category
      const displayCategory =
        lastConversationFromOwner?.category || thread.category;
      const categoryColor = getCategoryColor(displayCategory);

      // Get category icon
      const getCategoryIcon = (category: string) => {
        switch (category) {
          case "queried":
            return "question-line";
          case "escalated":
            return "arrow-up-line";
          case "reviewed":
            return "eye-line";
          case "question":
            return "question-answer-line";
          default:
            return "message-2-line";
        }
      };

      return {
        id: thread.identifier,
        name: otherUser?.name || `User ${otherUserId}`,
        avatar: otherUser?.name?.charAt(0) || "U",
        lastMessage:
          thread.conversations.length > 0
            ? thread.conversations[thread.conversations.length - 1].message
            : "No messages yet",
        time:
          thread.conversations.length > 0
            ? moment(
                thread.conversations[thread.conversations.length - 1].created_at
              ).format("h:mm a")
            : "Just now",
        unread: thread.conversations.filter((conv) => !conv.marked_as_read)
          .length,
        status: "online" as const,
        type: "personal" as const,
        threadData: thread,
        targetUserId: otherUserId,
        categoryColor: categoryColor,
        category: displayCategory,
        categoryIcon: getCategoryIcon(displayCategory),
      };
    });
  }, [allThreads, state.resources.users, state.loggedInUser?.id]);

  useEffect(() => {
    // Initialize comments from global state
    if (state.documentState && (state.documentState as any).comments) {
      setComments((state.documentState as any).comments);
    }
  }, [state.documentState]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: CommentProps = {
        id: crypto.randomUUID(),
        text: newComment.trim(),
        author: { value: staff?.id, label: staff?.name || "" },
        timestamp: new Date().toISOString(),
        type: commentType,
        status: "pending",
        seen: 0,
        liked: 0,
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      setNewComment("");

      // Update global state
      actions.setDocumentState({
        ...state.documentState,
        comments: updatedComments,
      } as any);
    }
  };

  // Handle adding message to a specific thread using WebSocket
  const handleAddMessageToThread = async (
    threadId: string,
    message: string
  ) => {
    if (!message.trim() || !state.loggedInUser || !state.existingDocument)
      return;

    // Send via WebSocket - thread creation is now handled by useConversationSocket
    if (currentThreadId && chatToken && state.existingDocument?.id) {
      try {
        const result = await sendRealtimeMessage(
          state.existingDocument.id,
          message.trim()
        );
        if (result) {
          // Show visual feedback that category was updated
          setCategoryUpdated(true);
          setTimeout(() => setCategoryUpdated(false), 2000);

          // Reset category selection to default after sending message
          setSelectedCategory("question");
          return;
        }
      } catch (error) {
        // WebSocket send failed
        // Note: No fallback to local state - thread creation is centralized in useConversationSocket
      }
    } else {
      // Cannot send message: missing currentThreadId, chatToken, or document ID
    }
  };

  // Handle Enter key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && threadId) {
        handleAddMessageToThread(threadId, newMessage);
        setNewMessage("");
      }
    }
  };

  const filteredChats = chatThreads.filter((chat) => {
    // Show all chats when "all" is selected
    if (activeTab === "all") {
      return true;
    }

    // Filter by thread category
    return chat.threadData.category === activeTab;
  });

  const handleChatSelect = (chatId: string) => {
    // Simplified: Just select the chat, thread creation is handled by useConversationSocket
    setSelectedChat(chatId);
    setShowChatView(true);

    // Initialize WebSocket connection with thread ID
    // Extract numeric thread ID from the chatId (assuming format like "thread_1_2_pointer_1234567890")
    const threadIdMatch = chatId.match(/thread_(\d+)_\d+_.*_(\d+)/);
    if (threadIdMatch) {
      const threadId = parseInt(threadIdMatch[2]); // Use the timestamp as thread ID
      setCurrentThreadId(threadId);
    }
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedChat(null);
    setCurrentThreadId(null); // Disconnect WebSocket
  };

  // Handle marking messages as read when viewing a conversation
  const markMessagesAsRead = (threadId: string) => {
    if (!state.existingDocument || !state.threads) return;

    const updatedThreads = (state.threads || []).map((thread) =>
      thread.identifier === threadId
        ? {
            ...thread,
            conversations: thread.conversations.map((conversation) => ({
              ...conversation,
              marked_as_read: true,
            })),
          }
        : thread
    );

    // Update global state using setThreads
    actions.setThreads(updatedThreads);
  };

  const selectedChatData = chatThreads.find((chat) => chat.id === selectedChat);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat && showChatView) {
      markMessagesAsRead(selectedChat);
    }
  }, [selectedChat, showChatView]);

  // Sync category selection with current thread's most recent conversation category
  useEffect(() => {
    if (selectedChat && showChatView && selectedChatData) {
      // Get the most recent conversation from the thread owner
      const lastConversationFromOwner =
        selectedChatData.threadData.conversations
          .filter(
            (conv) =>
              conv.user.id === selectedChatData.threadData.thread_owner_id
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

      // Use the last conversation's category, or default to "question"
      const categoryToUse = lastConversationFromOwner?.category || "question";
      setSelectedCategory(categoryToUse);
    }
  }, [selectedChat, showChatView, selectedChatData]);

  // Get category icon function
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "queried":
        return "question-line";
      case "escalated":
        return "arrow-up-line";
      case "reviewed":
        return "eye-line";
      case "question":
        return "question-answer-line";
      default:
        return "message-2-line";
    }
  };

  // Show access denied message if user is locked
  if (state.accessLevel === "lock") {
    return (
      <div className="threads__generator__tab">
        <div className="access-denied-container">
          <div className="access-denied-content">
            <div className="access-denied-icon">
              <i className="ri-lock-line"></i>
            </div>
            <h3>Access Restricted</h3>
            <p>
              You don&lsquo;t have permission to view or participate in this
              document&lsquo;s threads.
            </p>
            <div className="access-denied-details">
              <p>Contact your administrator if you believe this is an error.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="threads__generator__tab">
      {!showChatView ? (
        // Chat List View
        <div className="chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header__left">
              <div className="chat-header__avatar">
                {staff?.name?.charAt(0) || "U"}
              </div>
              <div className="chat-header__info">
                <h3>Document Threads</h3>
                <p>Manage discussions and feedback</p>
              </div>
            </div>
            <div className="chat-header__actions">
              <button className="chat-header__action-btn" title="Search">
                <i className="ri-search-line"></i>
              </button>
              <button className="chat-header__action-btn" title="More options">
                <i className="ri-more-2-line"></i>
              </button>
            </div>
          </div>

          {/* Chat Tabs */}
          <div className="chat-tabs__container" data-active-tab={activeTab}>
            {activityTypes.map((type) => (
              <button
                key={type}
                className={`chat-tab ${
                  activeTab === type ? "chat-tab--active" : ""
                }`}
                data-activity-type={type}
                onClick={() => setActiveTab(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type === "queried" && (
                  <span className="chat-tab__badge">
                    {
                      filteredChats.filter(
                        (chat) => chat.threadData.category === "queried"
                      ).length
                    }
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chat List */}
          <div className="chat-list">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-list__item"
                  style={{
                    borderLeft: `4px solid ${chat.categoryColor}`,
                  }}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="chat-list__avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${chat.avatar}&background=3b82f6&color=fff&size=96`}
                      alt={chat.name}
                    />
                    <div
                      className={`chat-list__status chat-list__status--${chat.status}`}
                    ></div>
                  </div>
                  <div className="chat-list__content">
                    <div className="chat-list__header">
                      <h4 className="chat-list__name">{chat.name}</h4>
                      <div
                        className="chat-list__category-indicator"
                        style={{
                          backgroundColor: chat.categoryColor,
                        }}
                        title={`Category: ${chat.category}`}
                      >
                        <i className={`ri-${chat.categoryIcon}`}></i>
                      </div>
                    </div>
                    <p className="chat-list__message">{chat.lastMessage}</p>
                  </div>
                  <div className="chat-list__meta">
                    <span className="chat-list__time">{chat.time}</span>
                    {chat.unread > 0 && (
                      <span className="chat-list__unread">{chat.unread}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="chat-list__empty">
                <p>No threads available</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <div className="chat-input__container">
              <textarea
                className="chat-input__field"
                placeholder="Type a message..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={1}
              />
              <div className="chat-input__actions">
                <button className="chat-input__action-btn" title="Attach file">
                  <i className="ri-attachment-2"></i>
                </button>
                <button className="chat-input__action-btn" title="Emoji">
                  <i className="ri-emotion-line"></i>
                </button>
                <button
                  className="chat-input__send-btn"
                  title="Send message"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Individual Chat View
        <div className="chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header__left">
              <button
                className="chat-header__action-btn"
                onClick={handleBackToList}
                title="Back to chats"
              >
                <i className="ri-arrow-left-line"></i>
              </button>
              <div className="chat-header__avatar">
                <img
                  src={`https://ui-avatars.com/api/?name=${selectedChatData?.avatar}&background=3b82f6&color=fff&size=96`}
                  alt={selectedChatData?.name}
                />
              </div>
              <div className="chat-header__info">
                <h3>{selectedChatData?.name}</h3>
                <p>
                  {selectedChatData?.status === "online" ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="chat-header__actions">
              {/* Connection Status Indicator */}
              <div className="chat-header__connection-status">
                {isTokenLoading ? (
                  <span className="connection-status connection-status--loading">
                    <i className="ri-loader-4-line"></i>
                    Connecting...
                  </span>
                ) : connectionState === "connected" && chatToken ? (
                  <span className="connection-status connection-status--connected">
                    <i className="ri-wifi-line"></i>
                    Connected
                  </span>
                ) : connectionState === "connecting" ? (
                  <span className="connection-status connection-status--loading">
                    <i className="ri-loader-4-line"></i>
                    Connecting...
                  </span>
                ) : (
                  <div className="connection-status connection-status--disconnected">
                    <span>
                      <i className="ri-wifi-off-line"></i>
                      {connectionState === "failed"
                        ? "Connection Failed"
                        : "Offline"}
                    </span>
                    <button
                      className="connection-retry-btn"
                      onClick={reconnect}
                      title="Retry connection"
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                  </div>
                )}
              </div>
              <button className="chat-header__action-btn" title="Voice call">
                <i className="ri-phone-line"></i>
              </button>
              <button className="chat-header__action-btn" title="Video call">
                <i className="ri-vidicon-line"></i>
              </button>
              <button className="chat-header__action-btn" title="More options">
                <i className="ri-more-2-line"></i>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {/* Display real-time messages if available, otherwise fallback to local state */}
            {(() => {
              const conversations =
                realtimeConversations && realtimeConversations.length > 0
                  ? realtimeConversations
                  : selectedChatData?.threadData?.conversations || [];

              // Sort conversations by created_at in ascending order (oldest first)
              const sortedConversations = conversations.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );

              return sortedConversations;
            })().length > 0 ? (
              // Use real-time messages if available, otherwise use local state
              (() => {
                const conversations =
                  realtimeConversations && realtimeConversations.length > 0
                    ? realtimeConversations
                    : selectedChatData?.threadData?.conversations || [];

                // Sort conversations by created_at in ascending order (oldest first)
                const sortedConversations = conversations.sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                );

                return sortedConversations;
              })().map((conversation) => {
                // Safe property access with fallbacks
                const conversationUser = conversation?.user || {};
                const userId = conversationUser?.id || null;

                const isThreadOwner =
                  userId === selectedChatData?.threadData?.thread_owner_id;
                const isLoggedInUser = userId === state.loggedInUser?.id;

                // For message positioning: if user is the logged-in user, show on right (outgoing)
                // If user is not the logged-in user, show on left (incoming)
                const isOutgoing = isLoggedInUser;

                const categoryColor = isThreadOwner
                  ? getCategoryColor(conversation.category)
                  : null;

                return (
                  <div
                    key={conversation.id}
                    className={`chat-message chat-message--${
                      isOutgoing ? "outgoing" : "incoming"
                    } ${isThreadOwner ? "chat-message--thread-owner" : ""}`}
                    style={
                      isThreadOwner
                        ? ({
                            "--category-color": categoryColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <div className="chat-message__avatar">
                      <img
                        src={`https://ui-avatars.com/api/?name=${
                          conversationUser?.name || "User"
                        }&background=3b82f6&color=fff&size=96`}
                        alt={conversationUser?.name || "User"}
                      />
                      {isThreadOwner && categoryColor && (
                        <div
                          className="chat-message__category-badge"
                          style={{
                            backgroundColor: categoryColor,
                          }}
                          title={`Thread Owner - ${conversation.category}`}
                        >
                          <i
                            className={`ri-${getCategoryIcon(
                              conversation.category
                            )}`}
                          ></i>
                        </div>
                      )}
                    </div>
                    <div className="chat-message__bubble">
                      <p className="chat-message__text">
                        {conversation.message}
                      </p>
                      <div className="chat-message__meta">
                        <div className="chat-message__time">
                          {moment(conversation.created_at).format(
                            "MMM D, h:mm a"
                          )}
                        </div>
                        {isOutgoing && (
                          <div className="chat-message__status">
                            {conversation.marked_as_read ? (
                              <i className="ri-check-double-line chat-message__status-icon"></i>
                            ) : conversation.delivered ? (
                              <i className="ri-check-line chat-message__status-icon"></i>
                            ) : (
                              <i className="ri-time-line chat-message__status-icon"></i>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="chat-message chat-message--system">
                <div className="chat-message__bubble">
                  <p className="chat-message__text">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div
            className={`chat-category-selector ${
              categoryUpdated ? "chat-category-selector--updated" : ""
            }`}
          >
            <div className="chat-category-selector__label">
              <i className="ri-tag-line"></i>
              <span
                style={{
                  fontSize: 11,
                }}
              >
                Select Category
              </span>
              {categoryUpdated && (
                <span className="chat-category-selector__feedback">
                  <i className="ri-check-line"></i>
                  Message Categorized!
                </span>
              )}
            </div>
            <div className="chat-category-selector__options">
              {activityTypes
                .filter((type) => type !== "all")
                .map((category) => (
                  <label
                    key={category}
                    className={`chat-category-option ${
                      selectedCategory === category
                        ? "chat-category-option--selected"
                        : ""
                    }`}
                    style={
                      {
                        "--category-color": getCategoryColor(category),
                      } as React.CSSProperties
                    }
                  >
                    <input
                      type="radio"
                      name="messageCategory"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) =>
                        setSelectedCategory(
                          e.target.value as PointerActivityTypesProps
                        )
                      }
                      className="chat-category-option__input"
                    />
                    <div className="chat-category-option__indicator">
                      <i className={`ri-${getCategoryIcon(category)}`}></i>
                    </div>
                    <span className="chat-category-option__label">
                      {category}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <div className="chat-input__container">
              <textarea
                className="chat-input__field"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, selectedChat || "")}
                rows={1}
              />
              <div className="chat-input__actions">
                <button className="chat-input__action-btn" title="Attach file">
                  <i className="ri-attachment-2"></i>
                </button>
                <button className="chat-input__action-btn" title="Emoji">
                  <i className="ri-emotion-line"></i>
                </button>
                <button
                  className="chat-input__send-btn"
                  title="Send message"
                  onClick={() => {
                    if (selectedChat) {
                      handleAddMessageToThread(selectedChat, newMessage);
                      setNewMessage("");
                    }
                  }}
                  disabled={!newMessage.trim() || !selectedChat}
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadsGeneratorTab;
