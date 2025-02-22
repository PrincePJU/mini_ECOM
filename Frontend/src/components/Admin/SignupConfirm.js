import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SignupConfirm = ({ apiBaseUrl }) => {
    const navigate = useNavigate();
    const { token } = useParams();

    const completeSignup = async () => {
        try {
            const res = await axios.post(`${apiBaseUrl}/user/confirm-signup/${token}`);
            toast.success("Signup confirmed successfully!");
            if (res.data) {
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed. Please try again.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', borderRadius: '20px' }}>
                <h3 className="text-center mb-4">Verified Your Email</h3>
                <p className="text-center">A verification is completed now click button</p>
                <button onClick={completeSignup} className="btn btn-success w-100">
                    Verify Email
                </button>
                <div className="text-center mt-3">
                    <button onClick={() => navigate("/signup")} className="btn btn-link">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupConfirm;
