import React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import axios from 'axios';
import SelectButtonGroup from './SelectButtonGroup';
import EmployeeList from "./EmployeeList";

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
  
  return (
    <>
      <SelectButtonGroup  {... {selectedButton, setSelectedButton } }/>
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
      <EmployeeList {... { selectedSubGroup , selectedButton} } />
    </>
  );
}
  