import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; // Assuming your main component is named App and located in App.js
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
