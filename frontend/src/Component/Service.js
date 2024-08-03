import { Link, useNavigate } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useContext } from "react";
import { Store } from "../Store";
import '../index.css';  // Ensure this import is present

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
        <Card className="service-card fancy-card">
            <Card.Body className="text-center">
                <Link to={`/service/${service.slug}`} className="service-link">
                    <Card.Title className="service-title">{service.name}</Card.Title>
                </Link>
                <Card.Text className="service-price">₱{service.price}</Card.Text>
                <Button
                    onClick={addToCartHandler}
                    className="btn-primary w-100"
                >
                    Get Started
                </Button>
            </Card.Body>
        </Card>
    );
}

export default Service;
