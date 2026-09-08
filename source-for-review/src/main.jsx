import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FitMyTruckApp from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FitMyTruckApp />
  </StrictMode>,
);
