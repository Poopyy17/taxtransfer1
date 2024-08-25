import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Service from '../Component/Service';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../Component/LoadingBox';
import MessageBox from '../Component/MessageBox';
import '../index.css';  // Ensure this import is present to include the styles
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, services: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

function HomeScreen() {
    const [{ loading, error, services }, dispatch] = useReducer(reducer, {
        services: [],
        loading: true,
        error: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const result = await axios.get('/api/services');
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: error.message });
            }
        };
        fetchData();
    }, []);

    const getStartedHandler = () => {
        if (services.length > 0) {
            // Redirect to the first service detail page
            navigate(`/service/${services[0].slug}`);
        }
    };

    return (
        <div>
            <header className="hero-section">
                <div className="hero-content">
                    <h1><strong>Optimizing Tax Transfer</strong></h1>
                    <p>Your trusted partner for seamless tax transfer services</p>
                    <Button onClick={getStartedHandler} className="btn-primary1">
                        Get Started
                    </Button>
                </div>
            </header>
            <main className="content-section">
                <Helmet>
                    <title>Property Tax Transferral</title>
                </Helmet>
            </main>
        </div>
    );
}

export default HomeScreen;
