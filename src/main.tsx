import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { getTimeBand } from "./services/timeBand";

function applyTimeBand() {
  const band = getTimeBand();
  document.documentElement.setAttribute("data-band", band);
  // Keep data-late for the existing dark treatment; deep-night and late both
  // trigger it so the room feels like night.
  if (band === "deep-night" || band === "late") {
    document.documentElement.setAttribute("data-late", "1");
  } else {
    document.documentElement.removeAttribute("data-late");
  }
}
applyTimeBand();
window.setInterval(applyTimeBand, 5 * 60 * 1000);

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
