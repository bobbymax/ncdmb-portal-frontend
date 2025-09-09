import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React, { useMemo, useState } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { DocumentActivity } from "app/Context/PaperBoardContext";
import moment from "moment";

type ActivitiesGeneratorTabProps = {
  category: DocumentCategoryResponseData | null;
};

const ActivitiesGeneratorTab: React.FC<ActivitiesGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const [selectedTracker, setSelectedTracker] = useState<string>("all");

  // Get unique trackers from activities
  const availableTrackers = useMemo(() => {
    const trackers = new Set<string>();
    state.documentActivities.forEach((activity) => {
      if (activity.metadata?.tracker_name) {
        trackers.add(activity.metadata.tracker_name);
      }
    });
    return Array.from(trackers);
  }, [state.documentActivities]);

  // Get activities sorted by timestamp (newest first) and filtered by tracker
  const sortedActivities = useMemo(() => {
    let filtered = [...state.documentActivities];

    if (selectedTracker !== "all") {
      filtered = filtered.filter(
        (activity) => activity.metadata?.tracker_name === selectedTracker
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [state.documentActivities, selectedTracker]);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    return moment(timestamp).fromNow();
  };

  // Get activity icon based on action type
  const getActivityIcon = (action: string) => {
    const iconMap: Record<string, string> = {
      document_toggle: "ri-toggle-line",
      workflow_action: "ri-flow-chart",
      content_add: "ri-add-circle-line",
      content_remove: "ri-delete-bin-line",
      content_edit: "ri-edit-line",
      content_reorder: "ri-drag-move-line",
      signature_start: "ri-quill-pen-line",
      signature_save: "ri-check-line",
      signature_cancel: "ri-close-line",
      tab_switch: "ri-layout-line",
      resource_link: "ri-links-line",
      document_generate: "ri-file-download-line",
    };
    return iconMap[action] || "ri-notification-line";
  };

  // Get activity color based on action type
  const getActivityColor = (action: string) => {
    const colorMap: Record<string, string> = {
      document_toggle: "text-emerald-600",
      workflow_action: "text-green-600",
      content_add: "text-lime-600",
      content_remove: "text-red-500",
      content_edit: "text-amber-600",
      content_reorder: "text-blue-600",
      signature_start: "text-purple-600",
      signature_save: "text-green-600",
      signature_cancel: "text-red-500",
      tab_switch: "text-indigo-600",
      resource_link: "text-teal-600",
      document_generate: "text-emerald-600",
    };
    return colorMap[action] || "text-gray-600";
  };

  return (
    <div className="activities__generator__tab">
      <div className="activities__header">
        <div className="activities__title">
          <i className="ri-line-chart-line"></i>
          <h3>Document Activities</h3>
        </div>
        <div className="activities__controls">
          {availableTrackers.length > 0 && (
            <div className="activities__filter">
              <select
                value={selectedTracker}
                onChange={(e) => setSelectedTracker(e.target.value)}
                className="filter__select"
              >
                <option value="all">All Stages</option>
                {availableTrackers.map((tracker) => (
                  <option key={tracker} value={tracker}>
                    {tracker}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="activities__count">
            <span className="count__badge">{sortedActivities.length}</span>
            <span className="count__label">activities</span>
            {sortedActivities.length > 0 && (
              <button
                className="clear__activities__btn"
                onClick={() => {
                  actions.clearDocumentActivities();
                }}
                title="Clear all activities (for testing)"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="activities__content">
        {sortedActivities.length === 0 ? (
          <div className="activities__empty">
            <div className="empty__icon">
              <i className="ri-notification-off-line"></i>
            </div>
            <div className="empty__message">
              <h4>No activities yet</h4>
              <p>
                Document activities will appear here as you work on the
                document.
              </p>
            </div>
          </div>
        ) : (
          <div className="activities__feed">
            {sortedActivities.map((activity: DocumentActivity, idx) => (
              <div key={idx} className="activity__item">
                <div
                  className="activity__icon"
                  data-type={activity.action_performed}
                >
                  <i
                    className={`${getActivityIcon(activity.action_performed)}`}
                  ></i>
                </div>
                <div className="activity__content">
                  <div className="activity__message">{activity.message}</div>
                  <div className="activity__meta">
                    <div className="activity__user">
                      <i className="ri-user-line"></i>
                      <span>{activity.user_name}</span>
                    </div>
                    <div className="activity__tracker">
                      <i className="ri-flow-chart-line"></i>
                      <span>
                        {activity.metadata?.tracker_name || "Unknown Stage"}
                      </span>
                    </div>
                    <div className="activity__time">
                      <i className="ri-time-line"></i>
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesGeneratorTab;
