import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";

import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HierarchyExplorer from "./HierarchyExplorer";

import SelectButtonGroup from "./SelectButtonGroup";

import EmployeeList from "./EmployeeList";
import TimelineView from "./TimelineView";

import "../buttonStyling.css";

const drawerWidth = 220;

export default function ResponsiveSidebar(props) {
  const [selectedButton, setSelectedButton] = React.useState(
    "/api/teams/hierarchy"
  );

  // Declares a state used to hold the contents of the selected hierarchy.
  const [hierarchyContents, setHierarchyContents] = React.useState(null);

  // Declares a state used to hold the IDs of the selected subgroups.
  const [selectedSubGroup, setSelectedSubGroup] = React.useState([null]);

  // Declare a state used to store what view the user should be presented with.
  const [selectedView, setSelectedView] = React.useState("Gallery");

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const viewLeftValue = "Gallery";
  const viewLeftName = "Gallery";
  const viewRightName = "Timeline";
  const viewRightValue = "Timeline";

  const hierarchyLeftValue = "/api/teams/hierarchy";
  const hierarchyLeftName = "Teams";
  const hierarchyRightValue = "/api/locations/hierarchy";
  const hierarchyRightName = "Loactions";

  const drawer = (
    <div>
      <Toolbar />
      <br />
      <h5>Select a view: </h5>
      <div className="drawerButtons">
        <SelectButtonGroup
          {...{
            selectedButton: selectedView,
            setSelectedButton: setSelectedView,
            leftValue: viewLeftValue,
            leftName: viewLeftName,
            rightValue: viewRightValue,
            rightName: viewRightName,
          }}
        />
      </div>
      <br />
      <h5>Select a hierarchy:</h5>
      <div className="drawerButtons">
        <SelectButtonGroup
          {...{
            selectedButton: selectedButton,
            setSelectedButton: setSelectedButton,
            leftValue: hierarchyLeftValue,
            leftName: hierarchyLeftName,
            rightValue: hierarchyRightValue,
            rightName: hierarchyRightName,
          }}
        />
      </div>
      <br />
      <h5>Filter by subgroup(s):</h5>
      <HierarchyExplorer
        {...{
          selectedSubGroup,
          setSelectedSubGroup,
          hierarchyContents,
          setHierarchyContents,
          selectedButton,
        }}
      />
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  let viewToRender;

  if (selectedView === "Gallery") {
    viewToRender = <EmployeeList {...{ selectedSubGroup, selectedButton }} />;
  } else if (selectedView === "Timeline") {
    viewToRender = <TimelineView {...{ selectedSubGroup, selectedButton }} />;
  } else {
    viewToRender = <h2>Error! - Invalid view selected!</h2>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#3084ac",
          width: "100%",
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Visual Whereabouts
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <>{viewToRender}</>
      </Box>
    </Box>
  );
}
