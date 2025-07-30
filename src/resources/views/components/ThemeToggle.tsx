import React from "react";
import { useTheme } from "app/Context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <i className={`ri-${isDarkMode ? "sun" : "moon"}-line`} />
    </button>
  );
};

export default ThemeToggle;
