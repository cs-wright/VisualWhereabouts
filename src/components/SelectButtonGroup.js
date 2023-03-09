import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function SelectButtonGroup( { selectedButton, setSelectedButton } ) {

  const handleChange = (event, newSelection) => {
    if (newSelection !== null) {
        setSelectedButton(newSelection);
    }
  };

  if (selectedButton == null ){
    setSelectedButton("/api/teams/hierarchy");
  }

  return (
    <>
        <ToggleButtonGroup
        color="primary"
        value={selectedButton}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
        >
        <ToggleButton value="/api/teams/hierarchy">Teams</ToggleButton>
        <ToggleButton value="/api/locations/hierarchy">Locations</ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}