import React, { useContext, useEffect, useReducer, useState } from 'react';
import CheckoutSteps from '../Component/CheckoutSteps';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../Component/LoadingBox';

const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return {...state, loading: true };
        case 'CREATE_SUCCESS':
            return {...state, loading: false };
        case 'CREATE_FAIL':
            return {...state, loading: false };

        default:
            return state;
    }
}

export default function PlaceOrderScreen() {

  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage('');
  };

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.taxPrice;
  
  const placeOrderHandler = async () => {
    try {
        dispatch({ type: 'CREATE_REQUEST'});

        const { data } = await axios.post(
            'api/orders',
            {
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            },
            {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            }
        );
        ctxDispatch({ type: 'CART_CLEAR' });
        dispatch({ type: 'CREATE_SUCCESS' });
        localStorage.removeItem('cartItems');
        navigate(`/requests/${data.order._id}`)
    } catch (error) {
        dispatch({ type: 'CREATE_FAIL' });
        toast.error(getError(error))
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
        navigate('/payment')
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Info</title>
      </Helmet>
      <h1 className="my-3">Preview Info</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="info-title">Information</Card.Title>
              <Table striped bordered hover>
                <tbody>
                  <tr>
                    <td className="info-label">Tax Filer Name:</td>
                    <td>{cart.shippingAddress.fullName}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Address:</td>
                    <td>{cart.shippingAddress.address}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Recipient Name:</td>
                    <td>{cart.shippingAddress.recipientName}</td>
                  </tr>
                  <tr>
                    <td className="info-label">Type of Valid ID:</td>
                    <td>{cart.shippingAddress.validId}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="info-title">Payment</Card.Title>
              <Table striped bordered hover>
                <tbody>
                  <tr>
                    <td className="info-label">Method:</td>
                    <td>{cart.paymentMethod}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="info-title">Documents</Card.Title>
              <Row>
                {cart.shippingAddress.image && (
                  <Col xs={12} md={6} lg={4} className="mb-3">
                    <img
                      src={cart.shippingAddress.image}
                      alt="Primary document"
                      className="document-image"
                      onClick={() => handleImageClick(cart.shippingAddress.image)}
                    />
                  </Col>
                )}
                {cart.shippingAddress.images && cart.shippingAddress.images.length > 0 ? (
                  cart.shippingAddress.images.map((image, index) => (
                    <Col xs={12} md={6} lg={4} className="mb-3" key={index}>
                      <img
                        src={image}
                        alt={`Uploaded document ${index + 1}`}
                        className="document-image"
                        onClick={() => handleImageClick(image)}
                      />
                    </Col>
                  ))
                ) : (
                  cart.shippingAddress.image ? null : (
                    <Col xs={12}>
                      <ListGroup.Item>No documents uploaded</ListGroup.Item>
                    </Col>
                  )
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
        <Card>
            <Card.Body>
                <Card.Title>Summary</Card.Title>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <Row>
                            <Col>Service</Col>
                            <Col>₱{cart.itemsPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Tax</Col>
                            <Col>₱{cart.taxPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            
                            <Col><strong>Total</strong></Col>
                            <Col><strong>₱{cart.totalPrice.toFixed(2)}</strong></Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <div className='d-grid'>
                            <Button
                                type="button"
                                onClick={placeOrderHandler}
                                disabled={cart.shippingAddress.images.length === 0}
                            >
                                Submit Request
                            </Button>
                            {loading && <LoadingBox></LoadingBox>}
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Body>
          <img src={selectedImage} alt="Zoomed document" style={{ width: '100%' }} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
