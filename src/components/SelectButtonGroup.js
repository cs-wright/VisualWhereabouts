import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function SelectButtonGroup( { selectedButton, setSelectedButton, leftValue, leftName, rightValue, rightName } ) {
  const handleChange = (event, newSelection) => {
    if (newSelection !== null) {
        setSelectedButton(newSelection);
    }
  };

  if (selectedButton == null ){
    setSelectedButton(leftValue);
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
        <ToggleButton value={leftValue}>{leftName}</ToggleButton>
        <ToggleButton value={rightValue}>{rightName}</ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}