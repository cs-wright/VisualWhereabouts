import React from 'react';
import axios from 'axios';
import { Row, Col } from 'react-simple-flex-grid';
import "react-simple-flex-grid/lib/main.css";

import "bootstrap/dist/css/bootstrap.min.css";

const baseURL = 'https://whowhatwhere.azurewebsites.net';

function EmployeeCard({imgPathContactable, firstName, surname }) {
    const imageURL = "https://whowhatwhere.azurewebsites.net/" + imgPathContactable;
    return (        
        <div className='card'>
          <img className='card-img-top' src={imageURL} alt='{firstName} {surname}' />
          <div className='card-body'>
            <h5 className='card-title'>{firstName} {surname}</h5>
            <p className='card-text'></p>
          </div>
        </div>
    );
}

export default function EmployeeList( { selectedSubGroup, selectedButton }) {

    const [person, setPerson] = React.useState([]);

    React.useEffect(() => {
        if (selectedSubGroup[0] == null){
            axios.get(baseURL + '/api/persons').then((response) => {
                setPerson(response.data);
            });
        }
        else{
            let hierarchy = 'teams';
            if ( selectedButton.includes('locations') ){
                hierarchy = 'locations';
            }
            // Get all members of the selected sub groups and their children.
            const results = selectedSubGroup.map( x => axios.get( baseURL + '/api/persons/' + hierarchy + '/' + x +'/all') );
            
            let idList;

            axios.all(results).then( (response) => {
                // Extract the employee data from each response.
                idList = response.map( x => x.data)

                // Merge the responses into a single array of employees (can contain duplicates at this point)!
                idList = idList.flat(1);

                // Remove duplicates (Needed if the users selection contains a sub groups child group).
                idList = [...new Map(idList.map(item => [item.id, item])).values()];

                // Strip away all user information and isolate employee IDs.
                idList = idList.map( x => x.id);

                // Generate the api request(s) needed for each employee ID in the idList variable.
                let peopleArray = idList.map( x => axios.get( baseURL + '/api/persons/' + x + '/full' ) );

                // Request detailed information for all employees and assign the resulting JSON to the person state.
                axios.all(peopleArray).then( (response) => {
                    let t = response.map( x => x.data );
                    t = t.flat(1);
                    setPerson(t);
                });
            
            })



        }
    }, [selectedSubGroup, selectedButton]);

    if (!person) {
        return (<h1>Something went wrong</h1>);
    }

    let peopleArray;

    peopleArray = person.map((element) => {
        return ( 
            <Col 
                xs={{ span: 6 }} sm={{ span: 4 }} md={{ span: 3 }}
                lg={{ span: 3 }} xl={{ span: 2 }}
            >
                <EmployeeCard imgPathContactable={element.imgPathContactable} firstName={element.firstName} surname={element.surname}/> 
        </Col>
        );
    })


    return(
        <div>
            <Row gutter={40}>
                {peopleArray}
            </Row>
        </div>
    )
    
    
}