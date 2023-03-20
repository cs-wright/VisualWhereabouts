import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

import HierarchyExplorer from "./components/HierarchyExplorer";
import ResponsiveSidebar from "./components/ResponsiveSidebar";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ResponsiveSidebar />
  </StrictMode>
);
