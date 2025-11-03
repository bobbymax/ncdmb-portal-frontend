import React from "react";
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
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-dropdown-header">
        <h4>Notifications{unreadCount > 0 && ` (${unreadCount})`}</h4>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={onMarkAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="notification-list">
        {notifications.length === 0 && !isLoading ? (
          <div className="notification-empty">
            <i className="ri-notification-off-line" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read_at ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item-content">
                  <div className={`notification-icon ${notification.data?.resource_type || 'default'}`}>
                    <i className={getNotificationIcon(notification.data?.resource_type || 'notification')} />
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">
                      {getNotificationMessage(notification)}
                    </div>
                    <div className="notification-message">
                      {getNotificationPreview(notification)}
                    </div>
                    <div className="notification-time">
                      {!notification.read_at && <span className="notification-unread-dot" />}
                      <i className="ri-time-line" />
                      <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <button 
                  onClick={onLoadMore} 
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#137547',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="notification-dropdown-footer">
        <a 
          href="#" 
          className="view-all-link" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/notifications');
            onClose();
          }}
        >
          View all notifications
        </a>
      </div>
    </div>
  );
};

export default NotificationDropdown;

