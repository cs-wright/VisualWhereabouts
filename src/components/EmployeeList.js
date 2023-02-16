import React from 'react';
import axios from 'axios';
import { Row, Col } from 'react-simple-flex-grid';
import "react-simple-flex-grid/lib/main.css";

import "bootstrap/dist/css/bootstrap.min.css";

const baseURL = 'https://whowhatwhere.azurewebsites.net/api/persons/';

function EmployeeCard({prop}) {
    console.log(prop);
    const imageURL = "https://whowhatwhere.azurewebsites.net/" + prop.imgPathContactable;
    return (        
        <div className='card'>
          <img className='card-img-top' src={imageURL} alt='{prop.firstName} {prop.surname}' />
          <div className='card-body'>
            <h5 className='card-title'>{prop.firstName} {prop.surname}</h5>
            <p className='card-text'></p>
          </div>
        </div>
    );
}

export default function EmployeeList() {
    const [person, setPerson] = React.useState(null);

    React.useEffect(() => {
        axios.get(baseURL).then((response) => {
            setPerson(response.data);
        });
    }, []);

    if (!person) return (<h1>Something went wrong</h1>);


    const peopleArray = person.map((element) => {
        return ( 
            <Col 
                xs={{ span: 6 }} sm={{ span: 4 }} md={{ span: 3 }}
                lg={{ span: 3 }} xl={{ span: 2 }}
            >
                <EmployeeCard prop={element}/> 
        </Col>
        );

    })

    return(
        <div>
            <Row gutter={40}>
                {peopleArray}
            </Row>
        </div>
        // <Container>
        //     <Row xs={1} md={8}>
        //         {peopleArray}
        //     </Row>

        // </Container>
        // <div className='card-deck'>
        //    {peopleArray}
        // </div>
        

    )
    
    
}