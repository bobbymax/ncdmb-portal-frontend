import React, { useState, useEffect, ChangeEvent } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useAuth } from "app/Context/AuthContext";
import moment from "moment";
import { DataOptionsProps } from "../forms/MultiSelect";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";

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
  category: any;
}

const CommentsGeneratorTab: React.FC<CommentsGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const { staff } = useAuth();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("comment");
  const [filterType, setFilterType] = useState<
    | "all"
    | "comment"
    | "feedback"
    | "review"
    | "question"
    | "suggestion"
    | "query"
  >("all");

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

  const handleUpdateCommentStatus = (
    commentId: string,
    status: "pending" | "resolved" | "rejected"
  ) => {
    const updatedComments = comments.map((comment) =>
      comment.id === commentId ? { ...comment, status } : comment
    );
    setComments(updatedComments);

    // Update global state
    actions.setDocumentState({
      ...state.documentState,
      comments: updatedComments,
    } as any);
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = comments.filter(
      (comment) => comment.id !== commentId
    );
    setComments(updatedComments);

    // Update global state
    actions.setDocumentState({
      ...state.documentState,
      comments: updatedComments,
    } as any);
  };

  const filteredComments = comments.filter(
    (comment) => filterType === "all" || comment.type === filterType
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return "ri-feedback-line";
      case "review":
        return "ri-eye-line";
      case "question":
        return "ri-question-line";
      case "suggestion":
        return "ri-lightbulb-line";
      case "query":
        return "ri-question-line";
      case "comment":
        return "ri-message-2-line";
      default:
        return "ri-message-2-line";
    }
  };

  const [showCommentModal, setShowCommentModal] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCommentType(e.target.value as CommentType);
  };

  return (
    <div className="comments__generator__tab">
      {/* Floating Add Comment Button */}
      <button
        className="floating__add__comment__btn"
        onClick={() => setShowCommentModal(true)}
        title="Add new comment"
      >
        <i className="ri-add-line"></i>
      </button>

      {/* iPhone-style Conversation Header */}
      <div className="conversation__header">
        <div className="conversation__title">
          <h3>Comments & Feedback</h3>
          <div className="conversation__subtitle">
            {comments.length} messages •{" "}
            {comments.filter((c) => c.status === "pending").length} pending
          </div>
        </div>
        <div className="conversation__filters">
          <button
            className={`filter__chip ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`filter__chip ${
              filterType === "comment" ? "active" : ""
            }`}
            onClick={() => setFilterType("comment")}
          >
            Comments
          </button>
          <button
            className={`filter__chip ${
              filterType === "feedback" ? "active" : ""
            }`}
            onClick={() => setFilterType("feedback")}
          >
            Feedback
          </button>
          <button
            className={`filter__chip ${
              filterType === "review" ? "active" : ""
            }`}
            onClick={() => setFilterType("review")}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* iPhone-style Conversation Thread */}
      <div className="conversation__thread">
        {filteredComments.length > 0 ? (
          <div className="messages__container">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`message__bubble ${
                  comment.author?.value === staff?.id ? "sent" : "received"
                }`}
              >
                <div className="message__content">
                  <div className="message__header">
                    <div className="message__author">
                      {comment.author?.label}
                    </div>
                    <div className="message__time">
                      {moment(comment.timestamp).format("HH:mm")}
                    </div>
                  </div>
                  <div className="message__text">{comment.text}</div>
                  <div className="message__footer">
                    <div className="message__type">
                      <i className={getTypeIcon(comment.type)}></i>
                      <span>{comment.type}</span>
                    </div>
                    <div className="message__status">
                      <span
                        className="status__dot"
                        style={{
                          backgroundColor: getStatusColor(comment.status),
                        }}
                      ></span>
                      <span className="status__text">{comment.status}</span>
                    </div>
                  </div>
                </div>
                <div className="message__actions">
                  <select
                    value={comment.status}
                    onChange={(e) =>
                      handleUpdateCommentStatus(
                        comment.id,
                        e.target.value as any
                      )
                    }
                    className="status__select"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    className="delete__message__btn"
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Delete message"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="conversation__empty">
            <div className="empty__icon">
              <i className="ri-message-2-line"></i>
            </div>
            <div className="empty__title">No messages yet</div>
            <div className="empty__subtitle">
              Start the conversation by adding a comment, feedback, or review
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div
          className="comment__modal__overlay"
          onClick={() => setShowCommentModal(false)}
        >
          <div className="comment__modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h4>Make Comment</h4>
              <button
                className="modal__close__btn"
                onClick={() => setShowCommentModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="modal__content">
              <div className="input__group">
                <Select
                  options={[
                    { value: "comment", label: "Comment" },
                    { value: "feedback", label: "Feedback" },
                    { value: "review", label: "Review" },
                    { value: "question", label: "Question" },
                    { value: "suggestion", label: "Suggestion" },
                    { value: "query", label: "Query" },
                  ]}
                  label="Type"
                  name="commentType"
                  defaultValue=""
                  defaultCheckDisabled
                  valueKey="value"
                  labelKey="label"
                  value={commentType}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input__group">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  name="newComment"
                  rows={4}
                  placeholder="Type your message here..."
                  label="Message"
                />
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__cancel__btn"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal__send__btn"
                onClick={() => {
                  handleAddComment();
                  setShowCommentModal(false);
                }}
                disabled={!newComment.trim()}
              >
                <i className="ri-send-plane-line"></i>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsGeneratorTab;
