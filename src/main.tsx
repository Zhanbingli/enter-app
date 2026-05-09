import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function applyLateFlag() {
  const hour = new Date().getHours();
  const isLate = hour >= 23 || hour < 6;
  if (isLate) {
    document.documentElement.setAttribute("data-late", "1");
  } else {
    document.documentElement.removeAttribute("data-late");
  }
}
applyLateFlag();
window.setInterval(applyLateFlag, 5 * 60 * 1000);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // service worker registration failure is non-fatal
    });
  });
}
