import { useState, useEffect, useCallback } from "react";
import { NotificationResponseData } from "app/Repositories/Notification/data";
import { ApiService } from "app/Services/ApiService";
import { useAuth } from "app/Context/AuthContext";
import { toast } from "react-toastify";

interface NotificationsApiResponse {
  status: string;
  data: NotificationResponseData[];
  current_page: number;
  last_page: number;
  total: number;
}

interface UnreadCountResponse {
  status: string;
  count: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<
    NotificationResponseData[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { staff } = useAuth();
  const apiService = new ApiService();

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!staff) return;

      setIsLoading(true);
      try {
        const response = await apiService.get<NotificationsApiResponse>(
          `notifications?page=${page}`
        );

        if (response.data) {
          const responseData = response.data as NotificationsApiResponse;
          if (append) {
            setNotifications((prev) => [...prev, ...responseData.data]);
          } else {
            setNotifications(responseData.data);
          }
          setHasMore(responseData.current_page < responseData.last_page);
          setCurrentPage(responseData.current_page);
        }
      } catch (error) {
        // Silent fail - not critical
      } finally {
        setIsLoading(false);
      }
    },
    [staff]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!staff) return;

    try {
      const response = await apiService.get<UnreadCountResponse>(
        "notifications/unread"
      );
      const responseData = response.data as UnreadCountResponse;
      setUnreadCount(responseData.count || 0);
    } catch (error) {
      // Silent fail
    }
  }, [staff]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiService.post(`notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      // Silent fail
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.post("notifications/read-all", {});
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  }, []);

  // Load more
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoading, fetchNotifications]);

  // Real-time listener
  useEffect(() => {
    if (!staff?.id) return;

    // Safely access Echo (lazy-loaded)
    try {
      const channel = (window as any).Echo?.private(
        `App.Models.User.${staff.id}`
      );

      if (!channel) return;

      channel.listen(".NewNotification", (data: any) => {
        // Add to list
        const newNotification: NotificationResponseData = {
          id: data.id,
          type: data.type,
          data: data.data,
          read_at: null,
          created_at: data.created_at,
          updated_at: data.created_at,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast
        const resourceType = data.data.resource_type?.replace(/_/g, " ");
        const action = data.data.action;
        toast.info(`New ${resourceType} ${action}`, {
          autoClose: 3000,
        });
      });

      return () => {
        channel.stopListening(".NewNotification");
      };
    } catch (error) {
      // Echo not initialized yet, skip
    }
  }, [staff?.id]);

  // Initial load
  useEffect(() => {
    if (staff) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [staff, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    loadMore,
  };
};
