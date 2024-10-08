import React, { useContext, useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { toast } from 'react-toastify';

export default function SigninScreen() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users/signin', {
                email,
                password,
            });
            ctxDispatch({ type: 'USER_SIGNIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect || '/');
        } catch (error) {
           toast.error(getError(error))
        }
    };

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
            <Helmet>
                <title>Sign In</title>
            </Helmet>
            <h1 className="my-3">Sign In</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" required
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
               <div className="mb-3">
                    <Button variant="warning" type="submit">Sign In</Button>
               </div>
               <div className="mb-3">
                    New User?{' '}
                    <Link to={`/signup?redirect=${redirect}`}>Create your Account</Link>
               </div>
               <div className='mb-3'>
                 Forgot Password? <Link to={`/forget-password`}>Reset Password</Link>
               </div>
            </Form>
        </Container>
  )
}
