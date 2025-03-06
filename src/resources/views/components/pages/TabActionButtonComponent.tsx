import { TabOptionProps } from "app/Repositories/BaseRepository";
import React from "react";
import { TabAction } from "resources/views/pages/ViewResourcePage";

const Tab = React.memo(({ action, toggleTab, isActive = false }: TabAction) => {
  const { variant, label, icon, title } = action;

  return (
    <li
      className={`tab-navigation-item ${variant} ${isActive ? "active" : ""}`}
      onClick={() => toggleTab(label)}
    >
      <i className={icon} />
      <p>{title}</p>
    </li>
  );
});
Tab.displayName = "Tab";

const TabActionButtonComponent = ({
  tabs,
  handleTabToggle,
  activeTab,
}: {
  tabs: TabOptionProps[];
  handleTabToggle: (value: string) => void;
  activeTab: string;
}) => {
  return (
    <nav className="tab-navigation mb-4">
      <ul>
        {tabs.map((action) => (
          <Tab
            key={action.label}
            action={action}
            toggleTab={handleTabToggle}
            isActive={activeTab === action.label}
          />
        ))}
      </ul>
    </nav>
  );
};

export default TabActionButtonComponent;
