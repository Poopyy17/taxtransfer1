import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

const PasswordField = ({ value, onChange, required = false }) => {
    const [password, setPassword] = useState(value || '');
    const [error, setError] = useState('');

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/; 
        return passwordRegex.test(password);
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setPassword(newValue);
        onChange(newValue);

        if (!validatePassword(newValue)) {
            setError('Password must include at least one uppercase letter and one number');
        } else {
            setError('');
        }
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
                type="password"
                value={password}
                onChange={handleChange}
                required={required}
            />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </Form.Group>
    );
};

export default PasswordField;
