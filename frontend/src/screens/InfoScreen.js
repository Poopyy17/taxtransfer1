import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../Component/CheckoutSteps';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../Component/LoadingBox';
import MessageBox from '../Component/MessageBox';

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: '' };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payload };
        default:
            return state;
    }
};

export default function InfoScreen() {
    const [{ loadingUpload }, dispatch] = useReducer(reducer, {
        loadingUpload: false,
        errorUpload: '',
    });

    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo, cart: { shippingAddress } } = state;

    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [category, setCategory] = useState(shippingAddress.category || '');
    const [recipientName, setRecipientName] = useState(shippingAddress.recipientName || '');
    const [validId, setValidId] = useState(shippingAddress.validId || '');
    const [image, setImage] = useState(shippingAddress.image || '');
    const [images, setImages] = useState(shippingAddress.images || []);

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/info');
        }

        // Retrieve and set images from local storage if available
        const storedShippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
        if (storedShippingAddress) {
            setImages(storedShippingAddress.images || []);
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        // Update local storage whenever images state changes
        localStorage.setItem('shippingAddress', JSON.stringify({
            fullName,
            address,
            image,
            images,
            category,
            recipientName,
            validId,
        }));
    }, [images, fullName, address, image, category, recipientName, validId]);

    const validIdOptions = [
        "Driver's License",
        "Passport",
        "Social Security Card",
        "State ID",
    ];

    const categoryOptions = [
        "Property",
    ];

    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({ type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                image,
                images,
                category,
                recipientName,
                validId,
            },
        });
        navigate('/payment');
    };

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

    return (
        <div>
            <Helmet>
                <title>Info</title>
            </Helmet>

            <CheckoutSteps step1 step2></CheckoutSteps>
            <div className='container small-container'>
                <h1 className='my-3'>Provide Information</h1>
                <Form onSubmit={submitHandler}>

                    <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {categoryOptions.map((id, index) => (
                                <option key={index} value={id}>
                                    {id}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="recipientName">
                        <Form.Label>Recipient Name</Form.Label>
                        <Form.Control
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="validId">
                        <Form.Label>Type of Valid ID</Form.Label>
                        <Form.Select
                            value={validId}
                            onChange={(e) => setValidId(e.target.value)}
                            required
                        >
                            <option value="">Select a valid ID</option>
                            {validIdOptions.map((id, index) => (
                                <option key={index} value={id}>
                                    {id}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>Image File</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => uploadFileHandler(e)}
                            required
                        />
                        {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="additionalImage">
                        <Form.Label>Upload Image</Form.Label>
                        {images.length === 0 && <MessageBox>No Image</MessageBox>}
                        <ListGroup variant="flush">
                            {images.map((x) => (
                                <ListGroup.Item key={x}>
                                    <img src={x} alt="Uploaded" style={{ width: '100px', cursor: 'pointer' }} onClick={() => setImage(x)} />
                                    <Button variant='light' onClick={() => deleteFileHandler(x)}>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <Form.Group className='mb-3' controlid="additionalImageFile">
                            <Form.Label>Upload Additional Image</Form.Label>
                            <Form.Control type='file' onChange={(e) => uploadFileHandler(e, true)} />
                            {loadingUpload && <LoadingBox></LoadingBox>}
                        </Form.Group>
                    </Form.Group>

                    <div className='mb-3'>
                        <Button 
                            variant='primary'
                            type='submit'
                        >
                            Continue
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
