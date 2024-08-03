import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../Component/LoadingBox';
import MessageBox from '../Component/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
           return {...state, loading: true };
        case 'FETCH_SUCCESS':
            return {...state, service: action.payload, loading: false };
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload };
        
        default:
           return state;
    }
};


function ServiceScreen() {
    const navigate = useNavigate();
    const params = useParams();
    const {slug} = params;

    const [{loading, error, service }, dispatch] = useReducer(reducer, {
        service: [],
        loading: true,
        error: '',
    });

    useEffect(() => {
      const fetchData = async () => {
        dispatch({type: 'FETCH_REQUEST' });
        try {
            const result = await axios.get(`/api/services/slug/${slug}`);
            console.log(result.data.image); // Log the image path
            dispatch({type: 'FETCH_SUCCESS', payload: result.data})
        } catch (error) {
          dispatch({type: 'FETCH_FAIL', payload: getError(error)});
        }
      };
      fetchData();
    }, [slug]);

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart } = state;
    const addToCartHandler = async () => {
        const existItem = cart.cartItems.find((x) => x._id === service._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/services/${service._id}`);
        ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...service, quantity }
    });
        navigate('/info')
    };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
        <Row>
            <Col md={6}>
              <img
              className="img-large"
              src={service.image}
              alt={service.name}
              ></img>
            </Col>
            <Col md={3}>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Helmet>
                        <title>{service.name}</title>
                    </Helmet>
                    <h1><strong>{service.name}</strong></h1>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Requirements:</strong>
                    <p style={{ lineHeight: '1.9' }}>
                      •Title of new owner (Certified Photocopy)<br />
                      •Deed of Sale/Donation/Exchange Certificate of Consolidation/Extra Judicial with Publication (Photocopy)<br />
                      •Current Realty Tax with Tax Clearance (Photocopy)<br />
                      •ECAR Certificate Authorizing Registration from BIR (Photocopy)<br />
                      •Transfer Tax Receipt with Confirmation/Certificate of Payment (Photocopy)<br />
                      •Picture of Property (Colored 3R)<br />
                      •Presentor ID (Photocopy)<br />
                  </p>
                  </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={3}>
            <Card>
                <Card.Body>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                        <Row>
                            <Col>Price: </Col>
                            <Col><strong>₱{service.price}</strong></Col>
                        </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className='d-grid'>
                                <Button 
                                onClick={addToCartHandler}
                                variant='primary'>
                                    Submit Requirements
                                </Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card.Body>
            </Card>
            </Col>
        </Row>
    </div>
  );
}

export default ServiceScreen