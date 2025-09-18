import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import moment from "moment";
import { DataOptionsProps } from "../forms/MultiSelect";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import {
  DocumentCategoryResponseData,
  PointerThreadProps,
  PointerActivityTypesProps,
  CategoryProgressTrackerProps,
} from "@/app/Repositories/DocumentCategory/data";

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
    const threads: PointerThreadProps[] = [...existingThreads];

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
        const thread: PointerThreadProps = {
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
            const thread: PointerThreadProps = {
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
            const thread: PointerThreadProps = {
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
            const thread: PointerThreadProps = {
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

      // Determine the category color based on the last conversation from thread owner
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
            return "#6b7280"; // Neutral gray
        }
      };

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

  // Handle adding message to a specific thread
  const handleAddMessageToThread = (threadId: string, message: string) => {
    if (!message.trim() || !state.loggedInUser || !state.existingDocument)
      return;

    const newConversation = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      message: message.trim(),
      created_at: new Date().toISOString(),
      user: {
        id: state.loggedInUser.id,
        name: state.loggedInUser.name || "Unknown User",
        email: state.loggedInUser.email || "",
        avatar: state.loggedInUser.name?.charAt(0) || "U",
      },
      replies: [],
      type: "comment" as const,
      category: selectedCategory,
      is_pinned: false,
      is_deleted: false,
      delivered: true,
      marked_as_read: false,
    };

    // Find the current tracker based on pointer
    const currentTracker = state.trackers.find(
      (tracker) => tracker.identifier === state.existingDocument?.pointer
    );

    if (!currentTracker) return;

    // Check if the thread exists in state.threads
    const existingThread = (state.threads || []).find(
      (thread) => thread.identifier === threadId
    );

    let updatedThreads = [...(state.threads || [])];

    if (!existingThread) {
      // Create a new thread if it doesn't exist
      const { user_id, created_by } = state.existingDocument;
      const loggedInUserId = state.loggedInUser.id;

      // Determine the recipient based on proper thread creation logic
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
          state.loggedInUser.groups?.some(
            (group) => group.id === currentTracker.group_id
          );

        if (hasDirectPermission || hasGroupPermission) {
          threadOwnerId = loggedInUserId; // Logged-in user as thread owner
          // For third-party users, we need to determine which thread they're trying to access
          // This should be handled by the threadId parameter, but for now use owner as default
          recipientId = user_id || 0;
        } else {
          // User has no permission - cannot create thread
          return;
        }
      } else {
        // Logged-in user is the creator - cannot create threads
        return;
      }

      const newThread: PointerThreadProps = {
        pointer_identifier: currentTracker.identifier,
        recipient_id: recipientId,
        identifier: threadId,
        thread_owner_id: threadOwnerId,
        category: selectedCategory,
        conversations: [newConversation],
        priority: "medium",
        status: "pending",
        state: "open",
        created_at: new Date().toISOString(),
      };

      updatedThreads.push(newThread);
    } else {
      // Update existing thread with new conversation
      updatedThreads = updatedThreads.map((thread) =>
        thread.identifier === threadId
          ? {
              ...thread,
              conversations: [...thread.conversations, newConversation],
            }
          : thread
      );
    }

    // Update global state using setThreads
    actions.setThreads(updatedThreads);

    // Show visual feedback that category was updated
    setCategoryUpdated(true);
    setTimeout(() => setCategoryUpdated(false), 2000);

    // Reset category selection to default after sending message
    setSelectedCategory("question");
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
    // Ensure the thread exists in global state before selecting
    const currentTracker = state.trackers.find(
      (tracker) => tracker.identifier === state.existingDocument?.pointer
    );

    if (currentTracker) {
      const existingThread = (state.threads || []).find(
        (thread) => thread.identifier === chatId
      );

      if (!existingThread) {
        // Create the thread if it doesn't exist
        const { user_id, created_by } = state.existingDocument!;
        const loggedInUserId = state.loggedInUser!.id;

        // Determine the recipient based on proper thread creation logic
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
            state.loggedInUser?.groups?.some(
              (group) => group.id === currentTracker.group_id
            );

          if (hasDirectPermission || hasGroupPermission) {
            threadOwnerId = loggedInUserId; // Logged-in user as thread owner
            // For third-party users, we need to determine which thread they're trying to access
            // This should be handled by the chatId parameter, but for now use owner as default
            recipientId = user_id || 0;
          } else {
            // User has no permission - cannot create thread
            return;
          }
        } else {
          // Logged-in user is the creator - cannot create threads
          return;
        }

        const newThread: PointerThreadProps = {
          pointer_identifier: currentTracker.identifier,
          recipient_id: recipientId,
          identifier: chatId,
          thread_owner_id: threadOwnerId,
          category: selectedCategory,
          conversations: [],
          priority: "medium",
          status: "pending",
          state: "open",
          created_at: new Date().toISOString(),
        };

        const updatedThreads = [...(state.threads || []), newThread];

        // Update global state using setThreads
        actions.setThreads(updatedThreads);
      }
    }

    setSelectedChat(chatId);
    setShowChatView(true);
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedChat(null);
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

  // Get category color function
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
            {selectedChatData?.threadData?.conversations &&
            selectedChatData.threadData.conversations.length > 0 ? (
              selectedChatData.threadData.conversations.map((conversation) => {
                const isThreadOwner =
                  conversation.user.id ===
                  selectedChatData.threadData.thread_owner_id;
                const isLoggedInUser =
                  conversation.user.id === state.loggedInUser?.id;

                const categoryColor = isThreadOwner
                  ? getCategoryColor(conversation.category)
                  : null;

                return (
                  <div
                    key={conversation.id}
                    className={`chat-message chat-message--${
                      isLoggedInUser ? "outgoing" : "incoming"
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
                        src={`https://ui-avatars.com/api/?name=${conversation.user.name}&background=3b82f6&color=fff&size=96`}
                        alt={conversation.user.name}
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
                        {conversation.user.id === state.loggedInUser?.id && (
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
                onKeyPress={(e) => handleKeyPress(e, selectedChat || "")}
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
