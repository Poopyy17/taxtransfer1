import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import LoadingBox from '../Component/LoadingBox';
import MessageBox from '../Component/MessageBox';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel'

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false };
        case 'APPROVE_REQUEST':
            return { ...state, loadingApprove: true };
        case 'APPROVE_SUCCESS':
            return { ...state, loadingApprove: false, successApprove: true };
        case 'APPROVE_FAIL':
            return { ...state, loadingApprove: false, successApprove: action.payload };
        case 'APPROVE_RESET':
            return { ...state, loadingApprove: false, successApprove: false };
        case 'DECLINE_REQUEST':
            return { ...state, loadingDecline: true };
        case 'DECLINE_SUCCESS':
            return { ...state, loadingDecline: false, successDecline: true };
        case 'DECLINE_FAIL':
            return { ...state, loadingDecline: false, successDecline: false, errorDecline: action.payload };
        case 'DECLINE_RESET':
            return { ...state, loadingDecline: false, successDecline: false };
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: '' };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payload };
        case 'REFRESH_PRODUCT':
            return {...state, order: action.payload };
        case 'CREATE_REQUEST':
            return {...state, loadingCreateReview: true };
        case 'CREATE_SUCCESS':
            return {...state, loadingCreateReview: false };
        case 'CREATE_FAIL':
            return {...state, loadingCreateReview: false };
        default:
            return state;
    }
}

export default function OrderScreen() {

    let reviewsRef = useRef();

    const { state } = useContext(Store);
    const { userInfo } = state;

    const params = useParams();
    const { id: orderId } = params;
    const navigate = useNavigate();
    
    const [{ loading, error, order, successPay, loadingPay, loadingApprove, successApprove, loadingDecline, successDecline, loadingUpload, loadingCreateReview }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        successPay: false,
        loadingPay: false,
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');
    const [images, setImages] = useState([]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage('');
    };

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    function createOrder(data, actions) {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: { value: order.totalPrice },
                    },
                ],
            })
            .then((orderID) => {
                return orderID;
            });
    }

    function onApprove(data, actions) {
        return actions.order.capture().then(async function (details) {
            try {
                dispatch({ type: 'PAY_REQUEST' });
                const { data } = await axios.put(
                    `/api/orders/${order._id}/pay`,
                    details,
                    {
                        headers: { authorization: `Bearer ${userInfo.token}` },
                    }
                );
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                toast.success('Transaction is paid');
            } catch (error) {
                dispatch({ type: 'PAY_FAIL', payload: getError(error) });
                toast.error(getError(error));
            }
        });
    }

    function onError(error) {
        toast.error(getError(error));
    }

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/orders/${orderId}`, {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
        };

        if (!userInfo) {
            return navigate('/signin');
        }
        if (!order._id || successPay || successApprove || successDecline || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                dispatch({ type: 'PAY_RESET' });
            }
            if (successApprove) {
                dispatch({ type: 'APPROVE_RESET' });
            }
            if (successDecline) {
                dispatch({ type: 'DECLINE_RESET' });
            }
        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'clientId': clientId,
                        currency: 'PHP',
                    },
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            };
            loadPaypalScript();
        }
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay, successApprove, successDecline]);

    async function approveHandler() {
        try {
            dispatch({ type: 'APPROVE_REQUEST' });
            const { data } = await axios.put(
                `/api/orders/${order._id}/approve`,
                {},
                {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({ type: 'APPROVE_SUCCESS', payload: data });
            toast.success('Transaction Approved');
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'APPROVE_FAIL', payload: getError(error) });
        }
    }

    async function declineHandler() {
        try {
            dispatch({ type: 'DECLINE_REQUEST' });
            const { data } = await axios.put(
                `/api/orders/${order._id}/decline`,
                {},
                {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({ type: 'DECLINE_SUCCESS', payload: data });
            toast.success('Request Declined');
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'DECLINE_FAIL', payload: getError(error) });
        }
    }

    const uploadFileHandler = async (e, forImages = false) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: 'UPLOAD_SUCCESS' });
    
            if (forImages) {
                setImages([...images, data.secure_url]);
            } else {
                setImage(data.secure_url);
                setImages([data.secure_url]); // Ensure the main image is also part of the images array
            }
            toast.success('Image uploaded successfully.');
        } catch (err) {
            toast.error(getError(err));
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
        }
    };
    
    const deleteFileHandler = (fileName) => {
        setImages(images.filter((x) => x !== fileName));
        toast.success('Image removed successfully');
    };

    const submitHandler = async (e) => {
        if (!comment === 0) {
            toast.error('Please enter a comment and upload at least one image.');
            return;
        }
        try {
            const { data } = await axios.post(
                `/api/orders/${order._id}/reviews`,
                { 
                    comment, 
                    images, 
                },
                {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                }
            );
            dispatch({ type: 'CREATE_SUCCESS' });
            toast.success('Validation submitted!');
            order.reviews.unshift(data.review);
            dispatch({ type: 'REFRESH_ORDER', payload: order });
            window.scrollTo({
                behavior: 'smooth',
                top: reviewsRef.current.offsetTop,
            });
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'CREATE_FAIL' });
        }
    };
    
    const printAllImages = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Images</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .print-container { display: flex; flex-wrap: wrap; }
                        .print-image { margin: 10px; }
                        .print-image img { max-width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${order.reviews.map((review) => review.images.map((image) => `
                            <div class="print-image">
                                <img src="${image}" alt="Validation"/>
                            </div>
                        `)).flat().join('')}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function () {
                                window.close();
                            }
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return loading ? (
        <LoadingBox></LoadingBox>
    ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
    ) : (
        <div>
            <Helmet>
                <title>Request {orderId}</title>
            </Helmet>
            <h1 className='my-3'>Request {orderId}</h1>
            <Row>
                <Col md={8}>
                    <Card className='mb-3'>
                        <Card.Body>
                        {order.orderItems.map((item) => (
                        <Card.Title className="classification" key={item._id}>{item.name}</Card.Title>
                        ))}
                            <Card.Text>
                                <Table striped bordered hover>
                                    <tbody>
                                        <tr>
                                            <td className="info-label">Tax Filer Name:</td>
                                            <td>{order.shippingAddress.fullName}</td>
                                        </tr>
                                        <tr>
                                            <td className="info-label">Address:</td>
                                            <td>{order.shippingAddress.address}</td>
                                        </tr>
                                        <tr>
                                            <td className="info-label">Recipient Name:</td>
                                            <td>{order.shippingAddress.recipientName}</td>
                                        </tr>
                                        <tr>
                                            <td className="info-label">Type of Valid ID:</td>
                                            <td>{order.shippingAddress.validId}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Text>
                            <Card.Title>Validation Status</Card.Title>
                            {order.isApproved ? (
                                <MessageBox variant='success'>
                                    Approved at {order.approvedAt}
                                </MessageBox>
                            ) : order.isDeclined ? (
                                <MessageBox variant='danger'>
                                    Declined at {order.declinedAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant='warning'>
                                    Not yet approved
                                </MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method: </strong> {order.paymentMethod}
                            </Card.Text>
                            {order.isPaid ? (
                                <MessageBox variant='success'>
                                    Paid at {order.paidAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant='danger'>Not Paid</MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title className="info-title">Documents</Card.Title>
                            <Row>
                                {order.shippingAddress.image && (
                                    <Col xs={12} md={6} lg={4} className="mb-3">
                                        <img
                                            src={order.shippingAddress.image}
                                            alt="Primary document"
                                            className="document-image"
                                            onClick={() => handleImageClick(order.shippingAddress.image)}
                                        />
                                    </Col>
                                )}
                                {order.shippingAddress.images && order.shippingAddress.images.length > 0 ? (
                                    order.shippingAddress.images.map((image, index) => (
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
                                    order.shippingAddress.image ? null : (
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
                            <Card.Title><strong>Request Summary</strong></Card.Title>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Service:</strong></Col>
                                        <Col>₱{order.itemsPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Tax Price:</strong></Col>
                                        <Col>₱{order.taxPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Total:</strong></Col>
                                        <Col>₱{order.totalPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                {!order.isPaid && !userInfo.isAdmin && (
                                    <ListGroup.Item>
                                        {isPending ? (
                                            <LoadingBox />
                                        ) : (
                                            <div>
                                                {
                                                    order.isApproved && (
                                                        <PayPalButtons
                                                            createOrder={createOrder}
                                                            onApprove={onApprove}
                                                            onError={onError}
                                                        />
                                                    )
                                                }
                                            </div>
                                        )}
                                        {loadingPay && <LoadingBox></LoadingBox>}
                                    </ListGroup.Item>
                                )}
                                {userInfo.isAdmin && !order.isApproved && !order.isDeclined && (
                                    <ListGroup>
                                        {loadingApprove && <LoadingBox></LoadingBox>}
                                        <div className='d-grid'>
                                            <Button type='button' onClick={approveHandler}>
                                                Approve Request
                                            </Button>
                                        </div>
                                        &nbsp;
                                        {loadingDecline && <LoadingBox></LoadingBox>}
                                        <div className='d-grid'>
                                            <Button variant="danger" type='button' onClick={declineHandler}>
                                                Decline Request
                                            </Button>
                                        </div>
                                    </ListGroup>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                
        <div className='my-3'>
            <div className='validation-header'>
                <h2 ref={reviewsRef}>
                Validation Result
                </h2>
                <div className='button-group'>
                <Button
                disabled={order.reviews.length === 0 || !order.reviews.some(review => review.images.length > 0)}
                    variant='outline-primary'
                    onClick={printAllImages}
                >
                    Print All Images
                </Button>
                </div>
            </div>
            <div className='mb-3'>
                {order.reviews.length === 0 && (
                    <MessageBox>No validation yet</MessageBox>
                )}
            </div>
            <ListGroup>
                {order.reviews.map((review) => (
                    <ListGroup.Item key={review._id}>
                        <p>{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                            <Row>
                                {review.images.map((image, index) => (
                                    <Col xs={12} md={6} lg={4} key={index} className="mb-3">
                                        <img
                                            src={image}
                                            alt={`Uploaded document ${index + 1}`}
                                            style={{ width: '100px', cursor: 'pointer' }}
                                            onClick={() => handleImageClick(image)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <div className='my-3'>
                {userInfo.isAdmin && order.reviews.length === 0 ? (
                    <form onSubmit={submitHandler}>
                        <h2>Upload Validation Documents</h2>
                        <FloatingLabel
                            controlId="floatingTextarea"
                            label="Comments"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                placeholder='Leave a comment'
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </FloatingLabel>
                        <Form.Group className="mb-3" controlId="imageFile">
                            <Form.Label>Image File (Optional)</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={(e) => uploadFileHandler(e)}
                            />
                            {loadingUpload && <LoadingBox></LoadingBox>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="additionalImage">
                            <Form.Label>Upload Image</Form.Label>
                            {images.length === 0 && <MessageBox>No Image</MessageBox>}
                            <ListGroup variant="flush">
                                {images.map((x) => (
                                    <ListGroup.Item key={x}>
                                        <img src={x} alt="Uploaded" style={{ width: '100px', cursor: 'pointer' }} onClick={() => setSelectedImage(x)} />
                                        <Button variant='light' onClick={() => deleteFileHandler(x)}>
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <Form.Group className='mb-3' controlId="additionalImageFile">
                                <Form.Label>Upload Additional Image</Form.Label>
                                <Form.Control type='file' onChange={(e) => uploadFileHandler(e, true)} />
                                {loadingUpload && <LoadingBox></LoadingBox>}
                            </Form.Group>
                        </Form.Group>

                        <div className='mb-3'>
                            <Button
                                disabled={loadingCreateReview}
                                type='submit'
                            >
                                Submit
                            </Button>
                            {loadingCreateReview && <LoadingBox></LoadingBox>}
                        </div>
                    </form>
                ) : (
                    <div></div>
                )}
             </div>
            </div>
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
