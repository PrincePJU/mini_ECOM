import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = ({apiBaseUrl}) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle forgot password (send reset link)
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiBaseUrl}/user/forgot-password`, { email });
            setMessage(response.data.message);
            setError('');
            toast.success(response.data.message); // Show success toast
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            setMessage('');
            toast.error(err.response?.data?.error || 'An error occurred'); // Show error toast
        }
    };

    return (
        <>
            <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
                <Row className="w-100">
                    <Col xs={12} md={6} lg={4} className="mx-auto">
                        <div className="bg-white p-4 rounded shadow-sm">
                            <h2 className="text-center mb-4">Forgot Password</h2>
                            <Form onSubmit={handleForgotPassword}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        isInvalid={error && !email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid email address.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button className='mt-3' variant="primary" type="submit" block>
                                    Send Reset Link
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Toaster position="top-center" />
        </>
    );
};

export default ForgotPassword;
