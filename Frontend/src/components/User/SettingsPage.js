import React, { useState } from "react";
import LocationPicker from "./LocationPicker";
import { LoadScript } from '@react-google-maps/api';

const apiKey = 'AIzaSyATwAQvAmj3kqExYa5-SVUAnkIEZlHxR-c';

const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};

const SettingsPage = ({ apiBaseUrl, darkMode }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;
  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      <h2>Settings</h2>
      <h4>Location Picker</h4>
      <div>
        {/* LoadScript is only included here now */}
        <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
          <LocationPicker darkMode={darkMode} apiBaseUrl={apiBaseUrl} />
        </LoadScript>
      </div>
    </div>
  );
};

export default SettingsPage;
