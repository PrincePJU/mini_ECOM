import React from 'react';
import OverviewCards from "./OverviewCards";
import Charts from "./Charts";

// Dark and light mode color schemes
const darkModeColors = {
  background: "#111d2e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const Dashboard = ({ darkMode ,apiBaseUrl }) => {
  // Determine the colors based on darkMode
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background }}>
      {/* Content blocks */}
      <OverviewCards apiBaseUrl={apiBaseUrl} darkMode={darkMode} />
      <Charts darkMode={darkMode} apiBaseUrl={apiBaseUrl} />
    </div>
  );
};

export default Dashboard;
