import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "app/Hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";
import "../../assets/css/notifications.css";

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shake, setShake] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const prevUnreadCount = useRef(0);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  // Shake animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!bellRef.current?.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button
        className={`notification-bell ${shake ? "shake" : ""}`}
        onClick={handleToggle}
        aria-label="Notifications"
      >
        <i className="ri-notification-2-line" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        bellRef.current &&
        createPortal(
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            hasMore={hasMore}
            onClose={handleClose}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onLoadMore={loadMore}
          />,
          document.body
        )}
    </div>
  );
};

export default NotificationBell;

