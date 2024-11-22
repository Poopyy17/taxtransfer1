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
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [category, setCategory] = useState(shippingAddress.category || '');
  const [recipientName, setRecipientName] = useState(
    shippingAddress.recipientName || ''
  );
  const [validId, setValidId] = useState(shippingAddress.validId || '');
  const [image, setImage] = useState(shippingAddress.image || '');
  const [images, setImages] = useState(shippingAddress.images || []);

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [suffix, setSuffix] = useState('');

  const [block, setBlock] = useState('');
  const [lot, setLot] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');

  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientMiddleName, setRecipientMiddleName] = useState('');
  const [recipientContactNumber, setRecipientContactNumber] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientSuffix, setRecipientSuffix] = useState('');

  const combineFullName = () => {
    return `${lastName}, ${firstName} ${middleName} ${suffix}`.trim();
  };

  const combineAddress = () => {
    return `Block ${block} Lot ${lot} ${street} St., Brgy. ${barangay}, ${city}`.trim();
  };

  const combineRecipientName = () => {
    return `${recipientLastName}, ${recipientFirstName} ${recipientMiddleName} ${recipientSuffix}`.trim();
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/info');
    }

    // Retrieve and set images from local storage if available
    const storedShippingAddress = JSON.parse(
      localStorage.getItem('shippingAddress')
    );
    if (storedShippingAddress) {
      setImages(storedShippingAddress.images || []);
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    // Update local storage whenever images state changes
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        image,
        images,
        category,
        recipientName,
        validId,
      })
    );
  }, [images, fullName, address, image, category, recipientName, validId]);

  const validIdOptions = [
    "Driver's License",
    'Passport',
    'Social Security Card',
    'State ID',
  ];

  const categoryOptions = ['Property'];

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName: combineFullName(),
        address: combineAddress(),
        image,
        images,
        category,
        recipientName: combineRecipientName(),
        validId,
        recipientContactNumber,
        recipientEmail,
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
      <div className="container small-container">
        <h1 className="my-3">Provide Information</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Control
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <Form.Control
                  placeholder="Middle Name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="Suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                />
              </div>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Control
                  placeholder="Block"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <Form.Control
                  placeholder="Lot"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="Barangay"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>
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

          <Form.Group className="mb-3">
            <Form.Label>Recipient Name</Form.Label>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Control
                  placeholder="Last Name"
                  value={recipientLastName}
                  onChange={(e) => setRecipientLastName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="First Name"
                  value={recipientFirstName}
                  onChange={(e) => setRecipientFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <Form.Control
                  placeholder="Middle Name"
                  value={recipientMiddleName}
                  onChange={(e) => setRecipientMiddleName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <Form.Control
                  placeholder="Suffix"
                  value={recipientSuffix}
                  onChange={(e) => setRecipientSuffix(e.target.value)}
                />
              </div>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recipient Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="09XXXXXXXXX"
              value={recipientContactNumber}
              onChange={(e) => setRecipientContactNumber(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recipient Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
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
                  <img
                    src={x}
                    alt="Uploaded"
                    style={{ width: '100px', cursor: 'pointer' }}
                    onClick={() => setImage(x)}
                  />
                  <Button variant="light" onClick={() => deleteFileHandler(x)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Form.Group className="mb-3" controlid="additionalImageFile">
              <Form.Label>Upload Additional Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => uploadFileHandler(e, true)}
              />
              {loadingUpload && <LoadingBox></LoadingBox>}
            </Form.Group>
          </Form.Group>

          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
