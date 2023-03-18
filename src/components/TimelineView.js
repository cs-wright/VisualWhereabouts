import React from 'react';

import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css'
import "../timelineStyling.css"
import moment from 'moment'

import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';


const baseURL = 'https://whowhatwhere.azurewebsites.net';


export default function TimelineView({ selectedSubGroup, selectedButton }) {

  const [workstatuses, setWorkstatuses] = React.useState([]);
  const [employeeIDs, setEmployeeIDs] = React.useState([]);
  // const [lookupStatusID, setLookupStatusID] = React.useState();

  // Defines the height of each row used to display the employees schedules.
  const lineHeight = 50;

  React.useEffect(() => {
    if (selectedSubGroup[0] == null){
      // If no group has been selected show everyone!  
      selectedSubGroup[0]=40;
    }

      
    let hierarchy = 'teams';
    if ( selectedButton.includes('locations') ){
      hierarchy = 'locations';
    }

    // Get all members of the selected sub groups and their children.
    const results = selectedSubGroup.map( x => axios.get( baseURL + '/api/persons/' + hierarchy + '/' + x +'/all') );
      
    axios.all(results).then( (response) => {
      let idList;

      // Extract the employee data from each response.
      idList = response.map( x => x.data)

      // Merge the responses into a single array of employees (can contain duplicates at this point)!
      idList = idList.flat(1);

      // Remove duplicates (Needed if the users selection contains a sub groups child group).
      idList = [...new Map(idList.map(item => [item.id, item])).values()];

      // Strip away all user information and isolate employee IDs.
      idList = idList.map( x => {
          return {id:x.id};//, title:x.alias, image:"https://whowhatwhere.azurewebsites.net//images/Unknown_Colour_Square.jpg"};
      });
      
      const getEmployeeDetailsFromAPI = idList.map( x => axios.get( baseURL + '/api/persons/' + x.id ) );

      axios.all(getEmployeeDetailsFromAPI).then( (apiResponse) => {

        let data = apiResponse.map( x => x.data);
        
        // Merge the responses into a single array of employees (can contain duplicates at this point)!
        data = data.flat(1);

        setEmployeeIDs( data.map( x => {
            const image = baseURL+x.imgPathContactable;
            return {id:x.id, title:x.alias, image:image};
          }) 
         );


      
      
        axios.all(results).then( (response) => {


        // Generate the api request(s) needed for each employee ID in the idList variable.
        // let peopleArray = idList.map( x => axios.get( baseURL + '/api/persons/' + x + '/workstatus/all' ) );



        // // Request detailed information for all employees and assign the resulting JSON to the person state.
        // Uncomment line below to request data from API
        axios.get(baseURL + '/api/workstatuses').then((response) => { 
          let lookupStatusID = response.data;

              // To be replaced with API call once endpoint is implemented.
          response = [
          {
          "data": [
            {
              "id":14,
              "alias":"Ronnie",
              "firstName":"Ronald",
              "middlename":" ",
              "surname":"McDonald",
              "workEmail":"RM@mcd.com",
              "text":"Ronnie",
              "workstatuses":[
                {
                  "workstatusId": 13,
                  "workstatusShortName": "",
                  "startDtm": "2023-03-01T00:00:00.000Z",
                  "endDtm": "2023-03-13T12:30:00.000Z",
                  "isContactable": false
                },
                {
                  "workstatusId": 3,
                  "workstatusShortName": "",
                  "startDtm": "2023-03-13T12:30:00.000Z",
                  "endDtm": "2023-03-15T15:30:00.000Z",
                  "isContactable": true
                },
                {
                  "workstatusId": 5,
                  "workstatusShortName": "",
                  "startDtm": "2023-03-17T12:30:00.000Z",
                  "endDtm": "2023-03-20T15:30:00.000Z",
                  "isContactable": false
                }
              ]
            }
           ]
          }
          ];
          //axios.all(peopleArray).then( (response) => {

          let count = 0; // Each item on the timeline needs a unique ID.

          // Strip the response down to just the contents of the data property.
          let workstatusesArray = response.map( x => x.data);
        
          workstatusesArray = workstatusesArray.flat(1);

          workstatusesArray = workstatusesArray.map( x => {
            return x.workstatuses.map( y => {
              count++;
              return {...y,  "id":count, "group":x.id};
            });
          });
        
          workstatusesArray = workstatusesArray.flat(2);
        
          // Manipulate the array into a format that the timeline component can interpret.
          workstatusesArray= workstatusesArray.map ( x => {
          
            let workStatusLookUp = (lookupStatusID.find(item => item.id === x.workstatusId));


            return {
              "id":x.id,
              "group":x.group,
              "title":workStatusLookUp.shortName,
              "start_time":Date.parse( x.startDtm ),
              "end_time":Date.parse( x.endDtm),
              "canChangeGroup": false, // Ensures that the user can't move a work status on their timeline to another users schedule.
              "isContactable":x.isContactable
          
            }
          });
        
          setWorkstatuses(workstatusesArray);
        });
      });
    });
  });
  
}, [selectedSubGroup, selectedButton]);

  if (!workstatuses) {
      return (<h1>Something went wrong</h1>);
  }

  

  // Override the default renderer for items. Allows custom colours to be set for items.
  let itemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps
  }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    //NOTE: Component requires that the background colour changes when a item is selected.
    //      Colour RGB minor change is required (not noticeable to the naked eye).
    const bgColour = item.isContactable ? "rgb(59, 140, 58)" : "rgb(140, 58, 59)";
    const backgroundColor = itemContext.selected ? (item.isContactable ? "rgb(59, 141, 58)" : "rgb(141, 58, 59)") : bgColour;
    const borderColor = itemContext.selected ? "black" : "white";

    return (
      <div {...getItemProps(
          {style: {
              backgroundColor: backgroundColor,
              borderColor: borderColor,   
              color:"white",//Colour of the text in the timeline item.
              borderLeftWidth: itemContext.selected ? 4 : 1,
              borderRightWidth: itemContext.selected ? 4 : 1
            }
          }
        )
      }>
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}
  
        <div
          className="rct-item-content"
          style={{ maxHeight: `${itemContext.dimensions.height}` }}
        >
          {itemContext.title}
        </div>
  
        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
      </div>
    )};

    let groupRenderer = ({ group }) => {
      const height = lineHeight + "px"; //Ensure the picture stays contained within its row.
      return (
        <div className="custom-group">
          
          <CardHeader style={{height:height}}
            avatar={
              <Avatar
                alt={group.title}
                src={group.image}
              />
            }
            title={group.title}
          />
        </div>
      )
    
      
    };

  return (
        <>
        <Timeline
          groups={employeeIDs}
          items={workstatuses}
          sidebarContent="Person"
          defaultTimeStart={moment().add(-7, 'day')}
          defaultTimeEnd={moment().add(7, 'day')}
          lineHeight={lineHeight}
          minZoom={60 * 60 * 1000}
          maxZoom={365.24 * 86400 * 1000}
          itemRenderer={itemRenderer}
          groupRenderer={groupRenderer}
        >
        </Timeline>
      </>
    )
}
