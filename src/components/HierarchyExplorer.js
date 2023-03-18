import React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import axios from 'axios';
import SelectButtonGroup from './SelectButtonGroup';
import EmployeeList from "./EmployeeList";
import TimelineView from './TimelineView';

const baseURL = 'https://whowhatwhere.azurewebsites.net';

export default function HierarchyExplorer(hierarchyURI) {
  const [selectedButton, setSelectedButton] = React.useState('/api/teams/hierarchy');

  let selectedHierarchy = baseURL + selectedButton;

  // Declares a state used to hold the contents of the selected hierarchy.
  const [hierarchyContents, setHierarchyContents] = React.useState(null);

  // Declares a state used to hold the IDs of the selected subgroups.
  const [selectedSubGroup, setSelectedSubGroup] = React.useState([null]);

  const handleSelectSubGroup = (event, nodeIds) => {
    setSelectedSubGroup(nodeIds);
  };

  // Declare a state used to store what view the user should be presented with.
  const [selectedView, setSelectedView] = React.useState('Gallery');




  // Request the contents of the selected hierarchy from the API.
  React.useEffect(() => {
    axios.get(selectedHierarchy).then((response) => {
      setHierarchyContents(response.data);
    });
  }, [selectedHierarchy]);

  // If the API doesn't return any results.
  if (!hierarchyContents) return (<h1>Failed to import Hierarchies</h1>);

  // Convert the JSON response into a TreeItem component.
  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={(nodes.id).toString()} label={nodes.shortName}>
      {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node))
                    : null}
    </TreeItem>
  );

  const viewLeftValue = "Gallery";
  const viewLeftName = "Gallery";
  const viewRightName = "Timeline";
  const viewRightValue = "Timeline";
  
  const hierarchyLeftValue = "/api/teams/hierarchy";
  const hierarchyLeftName = "Teams";
  const hierarchyRightValue = "/api/locations/hierarchy";
  const hierarchyRightName = "Loactions";
  

  let viewToRender;

  if (selectedView === "Gallery"){
    viewToRender =  <EmployeeList {... { selectedSubGroup , selectedButton} } />;
  }
  else if ( selectedView === "Timeline"){
    viewToRender = <TimelineView {... { selectedSubGroup , selectedButton} } />
  }
  else{
    viewToRender = <h2>Error! - Invalid view selected!</h2>
  }


  return (
    <>
      <SelectButtonGroup  {... {selectedButton:selectedView, setSelectedButton:setSelectedView, leftValue:viewLeftValue, leftName:viewLeftName, rightValue:viewRightValue, rightName:viewRightName} }/>
      <SelectButtonGroup  {... {selectedButton:selectedButton, setSelectedButton:setSelectedButton, leftValue:hierarchyLeftValue, leftName:hierarchyLeftName, rightValue:hierarchyRightValue, rightName:hierarchyRightName} }/>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        selected={selectedSubGroup}
        onNodeSelect={handleSelectSubGroup}
        multiSelect
      >
        {renderTree(hierarchyContents)}
      </TreeView>

      {viewToRender}
    </>
  );
}
  