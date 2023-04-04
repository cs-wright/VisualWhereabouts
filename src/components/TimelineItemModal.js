import React from "react";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "dayjs/locale/en-gb";

import dayjs from "dayjs";
import axios from "axios";

function FieldSelector({
  fieldName,
  records,
  disableEditing = false,
  selectedValue,
  setSelectedValue,
}) {
  records = records.map((x) => {
    return (
      <MenuItem key={x.id} value={x.id}>
        {x.value}
      </MenuItem>
    );
  });

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} disabled={disableEditing}>
      <InputLabel id="demo-simple-select-helper-label">{fieldName}</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={selectedValue}
        label={fieldName}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Select a record</em>
        </MenuItem>

        {records}
      </Select>
    </FormControl>
  );
}

export default function TimelineItemModal({
  employeeArray,
  currentemployeeID = null,
  scheduleType = "workstatuses",
  scheduleValuesArray = [],
  scheduleArray,
  scheduleItemValue = null,
  selectedItem, // Used for showing the modal when appropriate.
  setSelectedItem, // Used to hide the modal when the user clicks away.
  setRefreshState,
}) {
  if (scheduleType !== "locations") {
    scheduleType = "workstatuses";
  }

  const [employeeRecord, setEmployeeRecord] = React.useState(
    currentemployeeID ? currentemployeeID : null
  );

  let validValue = scheduleValuesArray.find(
    (obj) => obj.value === scheduleItemValue
  );
  const [scheduleStatus, setScheduleStatus] = React.useState(
    validValue ? validValue.id : ""
  );

  const selectedItemRecord = scheduleArray.find(
    (obj) => obj.id === selectedItem[0]
  );
  const [statusStartTime, setStatusStartTime] = React.useState(
    selectedItemRecord ? dayjs(selectedItemRecord.start_time) : null
  );

  const [statusEndTime, setStatusEndTime] = React.useState(
    selectedItemRecord ? dayjs(selectedItemRecord.end_time) : null
  );

  const [statusIsContactable, setStatusIsContactable] = React.useState(
    selectedItemRecord.isContactable ? 1 : 0
  );

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  let handleCloseModal = () => {
    setSelectedItem([]);
  };

  let handleSaveChanges = () => {
    const baseURL = "https://whowhatwhere.azurewebsites.net";
    const startTime = statusStartTime.format("DD-MMM-YYYY[%20]HH:mm:ss");
    const endTime = statusEndTime.format("DD-MMM-YYYY[%20]HH:mm:ss");
    const requestType =
      scheduleType === "locations" ? "locations" : "workstatus";

    let requestURL =
      baseURL +
      "/api/persons/" +
      employeeRecord +
      "/" +
      requestType +
      "/" +
      scheduleStatus +
      "/range/" +
      startTime +
      "/" +
      endTime;

    if (requestType === "workstatus") {
      let bool = statusIsContactable ? 1 : 0;
      requestURL += "/" + bool;
    }

    console.log(requestURL);
    axios.get(requestURL).then((response) => {
      console.log(response);
      setRefreshState(response);
      handleCloseModal();
    });
  };

  employeeArray = employeeArray.map((x) => {
    return { id: x.id, value: x.title };
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Modal
        open={selectedItem[0]}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button onClick={handleCloseModal}>X</Button>
          <h1>Test</h1>
          <FieldSelector
            key="EmployeeFieldSelector"
            fieldName="Employee"
            records={employeeArray}
            disableEditing={true}
            selectedValue={employeeRecord}
            setSelectedValue={setEmployeeRecord}
          />

          <FieldSelector
            key="statusFieldSelector"
            fieldName={scheduleType}
            records={scheduleValuesArray}
            disableEditing={false}
            selectedValue={scheduleStatus}
            setSelectedValue={setScheduleStatus}
          />

          {scheduleType !== "locations" && (
            <FieldSelector
              key="IsContactableFieldSelector"
              fieldName={"Is Contactable?"}
              records={[
                { id: 0, value: "False" },
                { id: 1, value: "True" },
              ]}
              disableEditing={false}
              selectedValue={statusIsContactable}
              setSelectedValue={setStatusIsContactable}
            />
          )}

          <DateTimePicker
            label="Start Time"
            value={statusStartTime}
            onChange={(newValue) => setStatusStartTime(newValue)}
          />

          <DateTimePicker
            label="End Time"
            value={statusEndTime}
            onChange={(newValue) => setStatusEndTime(newValue)}
          />
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
}
