import React from "react";

import Timeline from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
import "react-calendar-timeline/lib/Timeline.css";
import "../timelineStyling.css";

import axios from "axios";
import Avatar from "@mui/material/Avatar";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SelectButtonGroup from "./SelectButtonGroup";

const baseURL = "https://whowhatwhere.azurewebsites.net";

function getStartOfWeek(today) {
  today = new Date(today);
  var day = today.getDay(),
    diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

  return new Date(today.setDate(diff)).setHours(0, 0, 0, 0);
}

export default function TimelineView({ selectedSubGroup, selectedButton }) {
  const [locationSchedule, setLocationSchedule] = React.useState([]);
  const [employeeIDs, setEmployeeIDs] = React.useState([]);

  // Declare a state used to store which schedule should be rendered workstatuses or locations.
  const [selectedSchedule, setSelectedSchedule] = React.useState("workstatus");

  // Default view is the current work week (Monday -> Friday)
  const defaultTimeStart = getStartOfWeek(new Date());
  const defaultTimeEnd = new Date(
    defaultTimeStart + 4 * 24 * 60 * 60 * 1000
  ).setHours(24, 0, 0, 0);

  const [visibleTimeStart, setVisibleTimeStart] =
    React.useState(defaultTimeStart);
  const [visibleTimeEnd, setVisibleTimeEnd] = React.useState(defaultTimeEnd);

  // Defines the height of each row used to display the employees schedules.
  const lineHeight = 50;

  React.useEffect(() => {
    if (selectedSubGroup[0] == null) {
      // If no group has been selected show everyone!
      selectedSubGroup[0] = 40;
    }

    let hierarchy = "teams";
    if (selectedButton.includes("locations")) {
      hierarchy = "locations";
    }

    // Get all members of the selected sub groups and their children.
    const results = selectedSubGroup.map((x) =>
      axios.get(baseURL + "/api/persons/" + hierarchy + "/" + x + "/all")
    );

    axios.all(results).then((response) => {
      let idList;

      // Extract the employee data from each response.
      idList = response.map((x) => x.data);

      // Merge the responses into a single array of employees (can contain duplicates at this point)!
      idList = idList.flat(1);

      // Remove duplicates (Needed if the users selection contains a sub groups child group).
      idList = [...new Map(idList.map((item) => [item.id, item])).values()];

      // Strip away all user information and isolate employee IDs.
      idList = idList.map((x) => {
        return { id: x.id }; //, title:x.alias, image:"https://whowhatwhere.azurewebsites.net//images/Unknown_Colour_Square.jpg"};
      });

      const getEmployeeDetailsFromAPI = idList.map((x) =>
        axios.get(baseURL + "/api/persons/" + x.id)
      );

      axios.all(getEmployeeDetailsFromAPI).then((apiResponse) => {
        let data = apiResponse.map((x) => x.data);

        // Merge the responses into a single array of employees.
        data = data.flat(1);

        setEmployeeIDs(
          data.map((x) => {
            const image = baseURL + x.imgPathContactable;
            return {
              id: x.id,
              title: x.alias,
              image: image,
            };
          })
        );

        let employeeLocationApiRequest = idList.map((x) =>
          axios.get(
            baseURL + "/api/persons/" + x.id + "/" + selectedSchedule + "/all"
          )
        );

        axios.all(employeeLocationApiRequest).then((response) => {
          let timelineItemID = -1; // Each item on the timeline needs a unique ID.

          // Strip the response down to just the contents of the data property.
          let locationsArray = response.map((x) => {
            let employeeID = parseInt(x.config.url.replace(/[^0-9]/g, ""));

            let timelineItems = x.data.map((y) => {
              timelineItemID++;

              // Put all the attributes that both schedule types share into an object.
              let generic = {
                id: timelineItemID,
                group: employeeID,
                title: y.shortName,
                start_time: Date.parse(y.startDtm),
                end_time: Date.parse(y.endDtm),
                canChangeGroup: false, // Ensures that the user can't move a work status on their timeline to another users schedule.
                locationMetaTypeId: y.locationMetaTypeId,
                canMove: false,
                canResize: false,
              };

              // Append the attributes unique to the selected schedule to the generic object before returning the newly formed object.
              if (selectedSchedule === "locations") {
                generic = {
                  ...generic,
                  locationMetaTypeId: y.locationMetaTypeId,
                };
              } else if (selectedSchedule === "workstatus") {
                generic = {
                  ...generic,
                  isContactable: y.isContactable,
                };
              }
              return generic;
            });
            return timelineItems;
          });

          locationsArray = locationsArray.flat(1);

          setLocationSchedule(locationsArray);
        });
      });
    });
  }, [selectedSubGroup, selectedButton, setLocationSchedule, selectedSchedule]);

  console.log(locationSchedule);
  if (!locationSchedule) {
    return <h1>Something went wrong</h1>;
  }

  // Override the default renderer for items. Allows custom colours to be set for items.
  let itemRenderer = ({ item, itemContext, getItemProps, getResizeProps }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    //NOTE: Component requires that the background colour changes when a item is selected.
    //      Colour RGB minor change is required (not noticeable to the naked eye).
    let grey = "rgb(148,149,153)";
    let blue = "rgb(47,135,175)";
    let red = "rgb(175, 74, 47)";
    let purple = "rgb(151, 47, 175)";
    let yellow = "rgb(175, 151, 47)";
    let green = "rgb(47, 175, 87)";

    let bgColor;

    if (selectedSchedule === "locations") {
      if (item.locationMetaTypeId === -1) {
        bgColor = blue;
      } else if (item.locationMetaTypeId === -2) {
        bgColor = purple;
      } else if (item.locationMetaTypeId === -3) {
        bgColor = red;
      } else if (item.locationMetaTypeId === -4) {
        bgColor = grey;
      }
    } else if (selectedSchedule === "workstatus") {
      if (item.isContactable === true) {
        bgColor = green;
      } else if (item.isContactable === false) {
        bgColor = red;
      } else {
        bgColor = grey;
      }
    }

    bgColor = itemContext.selected ? yellow : bgColor;
    const borderColor = itemContext.selected ? "black" : "white";

    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor: bgColor,
            borderColor: borderColor,
            color: "white", //Colour of the text in the timeline item.
            borderLeftWidth: itemContext.selected ? 4 : 1,
            borderRightWidth: itemContext.selected ? 4 : 1,
          },
        })}
      >
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ""}

        <div
          className="rct-item-content"
          style={{ maxHeight: `${itemContext.dimensions.height}` }}
        >
          {itemContext.title}
        </div>

        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ""}
      </div>
    );
  };

  let groupRenderer = ({ group }) => {
    const height = lineHeight + "px"; //Ensure the picture stays contained within its row.
    return (
      <div className="custom-group">
        <CardHeader
          style={{ height: height }}
          avatar={<Avatar alt={group.title} src={group.image} />}
          title={group.title}
        />
      </div>
    );
  };

  let todayMinusTwoMonths = getStartOfWeek(
    new Date().setMonth(new Date(defaultTimeStart).getMonth() - 2)
  );
  let todayPlusTwoMonths = getStartOfWeek(
    new Date().setMonth(new Date(defaultTimeStart).getMonth() + 2)
  );

  let handleTimeChange = (
    visibleTimeStart,
    visibleTimeEnd,
    updateScrollCanvas
  ) => {
    if (
      visibleTimeStart < todayMinusTwoMonths &&
      visibleTimeEnd > todayPlusTwoMonths
    ) {
      setVisibleTimeStart(todayMinusTwoMonths);
      setVisibleTimeEnd(todayPlusTwoMonths);
    } else if (
      visibleTimeStart < todayMinusTwoMonths &&
      visibleTimeEnd < todayPlusTwoMonths
    ) {
      setVisibleTimeStart(todayMinusTwoMonths);
      setVisibleTimeEnd(visibleTimeEnd);
    } else if (
      visibleTimeEnd > todayPlusTwoMonths &&
      visibleTimeStart > todayMinusTwoMonths
    ) {
      setVisibleTimeStart(visibleTimeStart);
      setVisibleTimeEnd(todayPlusTwoMonths);
    } else {
      setVisibleTimeStart(visibleTimeStart);
      setVisibleTimeEnd(visibleTimeEnd);
    }
  };

  function jumpToToday() {
    setVisibleTimeStart(new Date().setHours(0, 0, 0, 0));
    setVisibleTimeEnd(new Date().setHours(24, 30, 0, 0));
  }

  function jumpToThisWeek() {
    const startOfWeek = getStartOfWeek(new Date());
    setVisibleTimeStart(startOfWeek);
    setVisibleTimeEnd(
      new Date(startOfWeek + 4 * 24 * 60 * 60 * 1000).setHours(24, 0, 0, 0)
    );
  }

  function jumpToNextTwoWeeks() {
    const startOfWeek = getStartOfWeek(new Date());
    setVisibleTimeStart(startOfWeek);
    setVisibleTimeEnd(
      new Date(startOfWeek + 11 * 24 * 60 * 60 * 1000).setHours(24, 0, 0, 0)
    );
  }

  const viewLeftValue = "workstatus";
  const viewLeftName = "Work Statuses";
  const viewRightName = "Locations";
  const viewRightValue = "locations";

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <h5 style={{ justifyContent: "flex-end" }}>Select Schedule: </h5>

          <SelectButtonGroup
            {...{
              selectedButton: selectedSchedule,
              setSelectedButton: setSelectedSchedule,
              leftValue: viewLeftValue,
              leftName: viewLeftName,
              rightValue: viewRightValue,
              rightName: viewRightName,
            }}
          />
        </Stack>
        <Stack spacing={"5px"} justifyContent="flex-end" direction="row">
          <h5 style={{ justifyContent: "flex-end" }}>Jump To: </h5>
          <Button variant="outlined" onClick={jumpToToday}>
            Today
          </Button>
          <Button variant="outlined" onClick={jumpToThisWeek}>
            This Week
          </Button>
          <Button variant="outlined" onClick={jumpToNextTwoWeeks}>
            Next Two Weeks
          </Button>
        </Stack>
      </Stack>
      <br />
      <Timeline
        groups={employeeIDs}
        items={locationSchedule}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        lineHeight={lineHeight}
        minZoom={60 * 60 * 1000 * 24}
        itemRenderer={itemRenderer}
        groupRenderer={groupRenderer}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={handleTimeChange}
      ></Timeline>
    </>
  );
}
