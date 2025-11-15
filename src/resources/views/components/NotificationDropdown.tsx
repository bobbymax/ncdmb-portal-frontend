import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationResponseData } from "app/Repositories/Notification/data";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  notifications: NotificationResponseData[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onLoadMore: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  hasMore,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isVisible, setIsVisible] = useState(false);

  // Smooth entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Filter notifications based on selected filter
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  const handleNotificationClick = (notification: NotificationResponseData) => {
    // Mark as read
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to resource
    if (notification.data.url) {
      const url = notification.data.url.replace('http://localhost:3000', '');
      navigate(url);
      onClose();
    }
  };

  const getNotificationIcon = (resourceType: string) => {
    const iconMap: Record<string, string> = {
      'inbound_instruction': 'ri-file-list-3-line',
      'inbound': 'ri-mail-line',
      'document': 'ri-file-text-line',
      'claim': 'ri-money-dollar-circle-line',
      'project': 'ri-folder-line',
      'query': 'ri-question-line',
    };
    return iconMap[resourceType] || 'ri-notification-line';
  };

  const getNotificationMessage = (notification: NotificationResponseData) => {
    const { resource_type, action, resource_data } = notification.data;
    const resourceName = resource_type?.replace(/_/g, ' ') || 'resource';
    
    // Try to get a meaningful title
    const title = resource_data?.instruction_type || 
                  resource_data?.title || 
                  resource_data?.ref_no ||
                  `New ${resourceName}`;
    
    return `${title} - ${action || 'updated'}`;
  };

  const getNotificationPreview = (notification: NotificationResponseData) => {
    const { resource_data, metadata } = notification.data;
    
    return resource_data?.instruction_text?.substring(0, 80) || 
           resource_data?.summary?.substring(0, 80) ||
           metadata?.inbound_ref ||
           metadata?.inbound_from ||
           'View details';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="notification-dropdown-backdrop"
        onClick={handleClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      
      <div
        className="notification-dropdown"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.98)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div className="notification-dropdown-header">
          <h4>Notifications</h4>
          <div className="notification-filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <span className="filter-badge">{unreadCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="notification-list">
          {filteredNotifications.length === 0 && !isLoading ? (
            <div className="notification-empty">
              <i className="ri-notification-off-line" />
              <p>
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            <>
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read_at ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    animationDelay: `${index * 0.03}s`,
                  }}
                >
                  <div className="notification-item-content">
                    <div className="notification-avatar-wrapper">
                      <div
                        className={`notification-icon ${
                          notification.data?.resource_type || "default"
                        }`}
                      >
                        <i
                          className={getNotificationIcon(
                            notification.data?.resource_type || "notification"
                          )}
                        />
                      </div>
                      {!notification.read_at && (
                        <span className="notification-unread-dot" />
                      )}
                    </div>
                    <div className="notification-body">
                      <div className="notification-title">
                        <span className="notification-sender">
                          {getNotificationMessage(notification)}
                        </span>
                        <span className="notification-time-text">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      <div className="notification-message">
                        {getNotificationPreview(notification)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="notification-load-more">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoading}
                    className="load-more-btn"
                  >
                    {isLoading ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div className="notification-dropdown-footer">
            <button className="mark-all-read-btn" onClick={onMarkAllAsRead}>
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;

