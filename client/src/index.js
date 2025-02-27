import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  // <React.StrictMode>
    <BrowserRouter> {/* Wrap the App component */}
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
