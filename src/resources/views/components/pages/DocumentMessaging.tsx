import React, { useState, useEffect, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import moment from "moment";
import {
  DocumentCategoryResponseData,
  PointerActivityTypesProps,
} from "@/app/Repositories/DocumentCategory/data";
import { ThreadResponseData } from "@/app/Repositories/Thread/data";
import usePusherSocket from "../../../../features/chat/usePusherSocket";

interface DocumentMessagingProps {
  category: DocumentCategoryResponseData | null;
}

const DocumentMessaging: React.FC<DocumentMessagingProps> = ({ category }) => {
  const { state, actions } = usePaperBoard();
  const { staff } = useAuth();

  // Main messaging state
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showIndividualChat, setShowIndividualChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | PointerActivityTypesProps>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // WebSocket connection state
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);
  const [threadDatabaseStatus, setThreadDatabaseStatus] = useState<
    Map<string, boolean>
  >(new Map());

  // Message input state
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PointerActivityTypesProps>("question");

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
    if (!currentThreadId || !selectedThread) return undefined;

    // First check if thread exists in actual state.threads (from backend)
    const existingThread = (state.threads || []).find(
      (thread) => thread.identifier === selectedThread
    );
    if (existingThread) {
      return existingThread;
    }

    // Fallback to generated threads if not found in backend threads
    return allThreads.find((thread) => thread.identifier === selectedThread);
  }, [currentThreadId, selectedThread, state.threads, allThreads]);

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
    isThreadInDatabase: threadDatabaseStatus.get(selectedThread || "") ?? false,
    selectedCategory: selectedCategory,
    globalThreads: state.threads || [], // Use actual backend threads, not generated ones
    selectedChatId: selectedThread || undefined,
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
      if (selectedThread) {
        setThreadDatabaseStatus((prev) =>
          new Map(prev).set(selectedThread, true)
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

  // Filter threads based on search and active tab
  const filteredThreads = chatThreads.filter((thread) => {
    const matchesSearch =
      thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" || thread.threadData.category === activeTab;

    return matchesSearch && matchesTab;
  });

  // Handle thread selection
  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
    setShowIndividualChat(true);

    // Initialize WebSocket connection with thread ID
    const threadIdMatch = threadId.match(/thread_(\d+)_\d+_.*_(\d+)/);
    if (threadIdMatch) {
      const threadId = parseInt(threadIdMatch[2]); // Use the timestamp as thread ID
      setCurrentThreadId(threadId);
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedThread ||
      !state.loggedInUser ||
      !state.existingDocument
    )
      return;

    if (currentThreadId && chatToken && state.existingDocument?.id) {
      try {
        const result = await sendRealtimeMessage(
          state.existingDocument.id,
          newMessage.trim()
        );
        if (result) {
          setNewMessage("");
          return;
        }
      } catch (error) {
        // WebSocket send failed
      }
    }
  };

  // Handle Enter key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    return null; // Don't show messaging if access is locked
  }

  return (
    <>
      {/* Fixed Bottom-Right Messaging Button */}
      <div className="document-messaging-fixed" data-expanded={isExpanded}>
        <div
          className="messaging-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="messaging-button__avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${
                staff?.name?.charAt(0) || "U"
              }&background=10b981&color=fff&size=96`}
              alt={staff?.name || "User"}
            />
          </div>
          <div className="messaging-button__content">
            <span className="messaging-button__text">Messaging</span>
            {filteredThreads.filter((thread) => thread.unread > 0).length >
              0 && (
              <span className="messaging-button__badge">
                {filteredThreads.filter((thread) => thread.unread > 0).length}
              </span>
            )}
          </div>
          <div className="messaging-button__controls">
            <i className="ri-more-2-line"></i>
            <i className={`ri-arrow-${isExpanded ? "down" : "up"}-line`}></i>
          </div>
        </div>
      </div>

      {/* Expanded Messaging Panel */}
      {isExpanded && (
        <div className="document-messaging-panel">
          {/* Panel Header */}
          <div className="messaging-panel__header">
            <div className="messaging-panel__title">
              <h3>Messaging</h3>
            </div>
            <div className="messaging-panel__controls">
              <button className="messaging-panel__control-btn" title="Search">
                <i className="ri-search-line"></i>
              </button>
              <button
                className="messaging-panel__control-btn"
                title="New message"
              >
                <i className="ri-add-line"></i>
              </button>
              <button
                className="messaging-panel__control-btn"
                title="Minimize"
                onClick={() => setIsExpanded(false)}
              >
                <i className="ri-subtract-line"></i>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="messaging-panel__search">
            <div className="messaging-search">
              <i className="ri-search-line"></i>
              <input
                type="text"
                placeholder="Search messages"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="messaging-search__input"
              />
              <button className="messaging-search__filter" title="Filter">
                <i className="ri-filter-line"></i>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="messaging-panel__tabs">
            {activityTypes.map((type) => (
              <button
                key={type}
                className={`messaging-tab ${
                  activeTab === type ? "messaging-tab--active" : ""
                }`}
                onClick={() => setActiveTab(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type === "queried" && (
                  <span className="messaging-tab__badge">
                    {
                      filteredThreads.filter(
                        (thread) => thread.threadData.category === "queried"
                      ).length
                    }
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Threads List */}
          <div className="messaging-panel__threads">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="messaging-thread"
                  style={{
                    borderLeft: `4px solid ${thread.categoryColor}`,
                  }}
                  onClick={() => handleThreadSelect(thread.id)}
                >
                  <div className="messaging-thread__avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${thread.avatar}&background=3b82f6&color=fff&size=96`}
                      alt={thread.name}
                    />
                    <div
                      className={`messaging-thread__status messaging-thread__status--${thread.status}`}
                    ></div>
                  </div>
                  <div className="messaging-thread__content">
                    <div className="messaging-thread__header">
                      <h4 className="messaging-thread__name">{thread.name}</h4>
                      <div
                        className="messaging-thread__category-indicator"
                        style={{
                          backgroundColor: thread.categoryColor,
                        }}
                        title={`Category: ${thread.category}`}
                      >
                        <i className={`ri-${thread.categoryIcon}`}></i>
                      </div>
                    </div>
                    <p className="messaging-thread__message">
                      {thread.lastMessage}
                    </p>
                  </div>
                  <div className="messaging-thread__meta">
                    <span className="messaging-thread__time">
                      {thread.time}
                    </span>
                    {thread.unread > 0 && (
                      <span className="messaging-thread__unread">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="messaging-thread__empty">
                <p>No threads available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Chat Pop-out */}
      {showIndividualChat && selectedThread && (
        <IndividualChatWindow
          threadId={selectedThread}
          threadData={currentThreadData}
          conversations={realtimeConversations}
          onClose={() => {
            setShowIndividualChat(false);
            setSelectedThread(null);
            setCurrentThreadId(null);
          }}
          onSendMessage={handleSendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onKeyPress={handleKeyPress}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          getCategoryColor={getCategoryColor}
          getCategoryIcon={getCategoryIcon}
          activityTypes={activityTypes}
          connectionState={connectionState}
          isTokenLoading={isTokenLoading}
          reconnect={reconnect}
          state={state}
        />
      )}
    </>
  );
};

// Individual Chat Window Component
interface IndividualChatWindowProps {
  threadId: string;
  threadData: ThreadResponseData | undefined;
  conversations: any[];
  onClose: () => void;
  onSendMessage: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  selectedCategory: PointerActivityTypesProps;
  setSelectedCategory: (category: PointerActivityTypesProps) => void;
  getCategoryColor: (category: string) => string;
  getCategoryIcon: (category: string) => string;
  activityTypes: ("all" | PointerActivityTypesProps)[];
  connectionState: string;
  isTokenLoading: boolean;
  reconnect: () => void;
  state: any;
}

const IndividualChatWindow: React.FC<IndividualChatWindowProps> = ({
  threadId,
  threadData,
  conversations,
  onClose,
  onSendMessage,
  newMessage,
  setNewMessage,
  onKeyPress,
  selectedCategory,
  setSelectedCategory,
  getCategoryColor,
  getCategoryIcon,
  activityTypes,
  connectionState,
  isTokenLoading,
  reconnect,
  state,
}) => {
  const selectedThreadData = threadData;

  return (
    <div className="individual-chat-window">
      {/* Chat Header */}
      <div className="individual-chat__header">
        <div className="individual-chat__header-left">
          <div className="individual-chat__avatar">
            <img
              src={`https://ui-avatars.com/api/?name=${
                selectedThreadData?.thread_owner_id === state.loggedInUser?.id
                  ? state.resources.users
                      .find(
                        (u: any) => u.id === selectedThreadData?.recipient_id
                      )
                      ?.name?.charAt(0) || "U"
                  : state.resources.users
                      .find(
                        (u: any) => u.id === selectedThreadData?.thread_owner_id
                      )
                      ?.name?.charAt(0) || "U"
              }&background=3b82f6&color=fff&size=96`}
              alt="User"
            />
          </div>
          <div className="individual-chat__info">
            <h3>
              {selectedThreadData?.thread_owner_id === state.loggedInUser?.id
                ? state.resources.users.find(
                    (u: any) => u.id === selectedThreadData?.recipient_id
                  )?.name || "User"
                : state.resources.users.find(
                    (u: any) => u.id === selectedThreadData?.thread_owner_id
                  )?.name || "User"}
            </h3>
            <p>Online</p>
          </div>
        </div>
        <div className="individual-chat__header-right">
          {/* Connection Status Indicator */}
          <div className="individual-chat__connection-status">
            {isTokenLoading ? (
              <span className="connection-status connection-status--loading">
                <i className="ri-loader-4-line"></i>
                Connecting...
              </span>
            ) : connectionState === "connected" ? (
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
          <button className="individual-chat__control-btn" title="More options">
            <i className="ri-more-2-line"></i>
          </button>
          <button
            className="individual-chat__control-btn"
            title="Close"
            onClick={onClose}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="individual-chat__messages">
        {(() => {
          const sortedConversations = conversations.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

          return sortedConversations.length > 0 ? (
            sortedConversations.map((conversation) => {
              const conversationUser = conversation?.user || {};
              const userId = conversationUser?.id || null;

              const isThreadOwner =
                userId === selectedThreadData?.thread_owner_id;
              const isLoggedInUser = userId === state.loggedInUser?.id;
              const isOutgoing = isLoggedInUser;

              const categoryColor = isThreadOwner
                ? getCategoryColor(conversation.category)
                : null;

              return (
                <div
                  key={conversation.id}
                  className={`individual-chat__message individual-chat__message--${
                    isOutgoing ? "outgoing" : "incoming"
                  } ${
                    isThreadOwner
                      ? "individual-chat__message--thread-owner"
                      : ""
                  }`}
                  style={
                    isThreadOwner
                      ? ({
                          "--category-color": categoryColor,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className="individual-chat__message-avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${
                        conversationUser?.name || "User"
                      }&background=3b82f6&color=fff&size=96`}
                      alt={conversationUser?.name || "User"}
                    />
                    {isThreadOwner && categoryColor && (
                      <div
                        className="individual-chat__message-category-badge"
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
                  <div className="individual-chat__message-bubble">
                    <p className="individual-chat__message-text">
                      {conversation.message}
                    </p>
                    <div className="individual-chat__message-meta">
                      <div className="individual-chat__message-time">
                        {moment(conversation.created_at).format(
                          "MMM D, h:mm a"
                        )}
                      </div>
                      {isOutgoing && (
                        <div className="individual-chat__message-status">
                          {conversation.marked_as_read ? (
                            <i className="ri-check-double-line individual-chat__message-status-icon"></i>
                          ) : conversation.delivered ? (
                            <i className="ri-check-line individual-chat__message-status-icon"></i>
                          ) : (
                            <i className="ri-time-line individual-chat__message-status-icon"></i>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="individual-chat__message individual-chat__message--system">
              <div className="individual-chat__message-bubble">
                <p className="individual-chat__message-text">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Category Selection */}
      <div className="individual-chat__category-selector">
        <div className="individual-chat__category-label">
          <i className="ri-tag-line"></i>
          <span>Select Category</span>
        </div>
        <div className="individual-chat__category-options">
          {activityTypes
            .filter((type) => type !== "all")
            .map((category) => (
              <label
                key={category}
                className={`individual-chat__category-option ${
                  selectedCategory === category
                    ? "individual-chat__category-option--selected"
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
                  className="individual-chat__category-option-input"
                />
                <div className="individual-chat__category-option-indicator">
                  <i className={`ri-${getCategoryIcon(category)}`}></i>
                </div>
                <span className="individual-chat__category-option-label">
                  {category}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="individual-chat__input">
        <div className="individual-chat__input-container">
          <textarea
            className="individual-chat__input-field"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyPress}
            rows={1}
          />
          <div className="individual-chat__input-actions">
            <button
              className="individual-chat__input-action-btn"
              title="Attach file"
            >
              <i className="ri-attachment-2"></i>
            </button>
            <button className="individual-chat__input-action-btn" title="Emoji">
              <i className="ri-emotion-line"></i>
            </button>
            <button
              className="individual-chat__input-send-btn"
              title="Send message"
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentMessaging;
