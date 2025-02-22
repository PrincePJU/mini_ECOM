import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

function ResetPassword({apiBaseUrl}) {
    const { token } = useParams(); // Use `useParams` to extract the token from the URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // To redirect to login page after successful password reset

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing token');
            toast.error('Invalid or missing token'); // Show error toast
        }
    }, [token]);

    // Handle reset password (submit new password)
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match'); // Show error toast
            return;
        }

        // Check password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            toast.error('Password must be at least 8 characters long'); // Show error toast
            return;
        }

        try {
            const response = await axios.post(`${apiBaseUrl}/user/reset-password/${token}`, { password });
            setError('');
            toast.success(response.data.message); // Show success toast
            setTimeout(() => {
                navigate('/'); // Redirect to login page after successful reset
            }, 2000); // Delay redirection to let the toast show
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            toast.error(err.response?.data?.error || 'An error occurred'); // Show error toast
        }
    };

    return (
        <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100">
                <Col xs={12} md={6} lg={4} className="mx-auto">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h2 className="text-center mb-4">Reset Password</h2>
                        <Form onSubmit={handleResetPassword}>
                            <Form.Group className="mb-2" controlId="formPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    isInvalid={error && password.length < 8}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Password must be at least 8 characters long.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-2" controlId="formConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    isInvalid={error && password !== confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Passwords do not match.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button className="mt-4" variant="primary" type="submit" block>
                                Reset Password
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>

            {/* Toaster for react-hot-toast */}
            <Toaster position="top-center" />
        </Container>
    );
}

export default ResetPassword;
