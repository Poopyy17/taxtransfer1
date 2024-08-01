import { Link, useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";

function Service(props) {
    const navigate = useNavigate();
    const { service } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const addToCartHandler = async () => {
        navigate(`/service/${service.slug}`);
    };

    return (
        <Card>
            <Link to={`/service/${service.slug}`}>
                <img 
                    className="card-img-top"
                    src={service.image} 
                    alt={service.name} 
                />
            </Link>
            <Card.Body className="d-flex flex-column align-items-center">
                <Link to={`/service/${service.slug}`} className="no-underline">
                    <Card.Title className="service-name">{service.name}</Card.Title>
                </Link>
                <Card.Text>₱{service.price}</Card.Text>
                <Button onClick={addToCartHandler} className="w-100 get-started">Get Started</Button>
            </Card.Body>
        </Card>
    );
}

export default Service;
