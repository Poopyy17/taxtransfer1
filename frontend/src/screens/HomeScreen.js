import React, { useEffect, useReducer, useState } from 'react'
// import data from '../data'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Service from '../Component/Service'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../Component/LoadingBox'
import MessageBox from '../Component/MessageBox'

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
           return {...state, loading: true };
        case 'FETCH_SUCCESS':
            return {...state, services: action.payload, loading: false };
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload };
        
        default:
           return state;
    }
};

function HomeScreen() {
    const [{loading, error, services}, dispatch] = useReducer(reducer, {
        services: [],
        loading: true,
        error: '',
    })
    // const [services, setServices] = useState([]);
    useEffect(() => {
      const fetchData = async () => {
        dispatch({type: 'FETCH_REQUEST' });
        try {
            const result = await axios.get('/api/services');
            dispatch({type: 'FETCH_SUCCESS', payload: result.data})
        } catch (error) {
          dispatch({type: 'FETCH_FAIL', payload: error.message});
        }
        
        // setServices(result.data);
      };
      fetchData();
    }, []);

  return (
    <div>
        <Helmet>
            <title>Tax Transfer</title>
        </Helmet>
        <h1>Featured Services</h1>
          <div className="services">
            {loading ? (
                <LoadingBox />
            ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
            ) : ( 
        <Row>
          {services.map((service) => (
            <Col key={service.slug} sm={6} md={4} lg={3} className='mb-3'>
            <Service service={service}></Service>
            </Col>
            ))}
            </Row>
        )}
        </div>
    </div>
  )
}


export default HomeScreen