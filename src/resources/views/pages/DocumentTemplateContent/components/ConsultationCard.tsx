import React from "react";

interface UserType {
  id: number;
  name?: string;
  firstname?: string;
  surname?: string;
  staff_no?: string;
  grade_level_object?: {
    name?: string;
    rank?: number;
  } | null;
}

interface ConsultationCardProps {
  uplines: UserType[];
  shouldShow: boolean;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({
  uplines,
  shouldShow,
}) => {
  if (!shouldShow) return null;

  // Generate initials from name
  const getInitials = (user: UserType) => {
    const name =
      user.name || `${user.firstname || ""} ${user.surname || ""}`.trim();
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="document__template__configuration consultation__card">
      <div className="consultation__header">
        <h3 className="consultation__title">
          <i className="ri-user-star-line"></i>
          Consult Superiors
        </h3>
        <span className="consultation__count">{uplines.length} Available</span>
      </div>

      {/* Consultants list */}
      <div className="consultants__list">
        {uplines.length === 0 ? (
          <div className="consultants__empty">
            <i className="ri-user-search-line"></i>
            <p className="empty-title">No superiors available</p>
            <p className="empty-subtitle">Your uplines will appear here</p>
          </div>
        ) : (
          uplines.map((consultant) => {
            const initials = getInitials(consultant);

            return (
              <div key={consultant.id} className="consultant__item">
                {/* Avatar with initials */}
                <div className="consultant__avatar-wrapper">
                  <div className="consultant__avatar">{initials}</div>
                  {/* Rank Badge */}
                  {consultant.grade_level_object?.rank !== undefined && (
                    <div className="consultant__rank-badge">
                      {consultant.grade_level_object.rank}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="consultant__info">
                  <div className="consultant__name">
                    {consultant.name ||
                      `${consultant.firstname || ""} ${
                        consultant.surname || ""
                      }`.trim()}
                  </div>
                  <div className="consultant__meta">
                    {consultant.staff_no && (
                      <span className="consultant__staff-no">
                        <i className="ri-user-line"></i>
                        {consultant.staff_no}
                      </span>
                    )}
                    {consultant.grade_level_object?.name && (
                      <>
                        <span className="consultant__separator">•</span>
                        <span className="consultant__grade">
                          <i className="ri-medal-line"></i>
                          {consultant.grade_level_object.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Icon */}
                <div className="consultant__action">
                  <i className="ri-chat-1-line"></i>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConsultationCard;
