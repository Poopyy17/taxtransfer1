import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../Component/LoadingBox';
import MessageBox from '../Component/MessageBox';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            // Sort orders by date in descending order
            const sortedOrders = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { ...state, orders: sortedOrders, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: true };
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false };
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        default:
            return state;
    }
};

export default function ValidationScreen() {
    const navigate = useNavigate();
    const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        orders: [],
    });

    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/orders`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(error),
                });
            }
        };
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        } else {
            fetchData();
        }
    }, [userInfo, successDelete]);

    const deleteHandler = async (order) => {
        if (window.confirm('Are you sure to delete?')) {
            try {
                dispatch({ type: 'DELETE_REQUEST' });
                await axios.delete(`/api/orders/${order._id}`, {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                toast.success('Request deleted successfully');
                dispatch({ type: 'DELETE_SUCCESS' });
            } catch (error) {
                toast.error(getError(error));
                dispatch({
                    type: 'DELETE_FAIL',
                });
            }
        }
    };

    return (
        <div>
            <Helmet>
                <title>Transactions</title>
            </Helmet>
            <h1>Requests</h1>
            {loadingDelete && <LoadingBox></LoadingBox>}
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>USER</th>
                            <th>DATE</th>
                            <th>TOTAL</th>
                            <th>PAID</th>
                            <th>VALIDATION</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>{order.totalPrice.toFixed(2)}</td>
                                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'Not yet'}</td>
                                <td>
                                    {order.isApproved
                                        ? 'Approved'
                                        : order.isDeclined
                                        ? 'Declined'
                                        : 'Pending'}
                                </td>
                                <td>
                                    <Button
                                        type="button"
                                        variant="light"
                                        onClick={() => {
                                            navigate(`/requests/${order._id}`);
                                        }}
                                    >
                                        Details
                                    </Button>
                                    &nbsp;
                                    <Button
                                        type="button"
                                        variant="light"
                                        onClick={() => deleteHandler(order)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
