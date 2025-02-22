import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Alert } from "react-bootstrap";

const SignupPage = ({ apiBaseUrl }) => {
  const [showAlert, setShowAlert] = useState({ visible: false, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const userInfo = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const res = await axios.post(`${apiBaseUrl}/user/signup`, userInfo);

      if (res.data.success) {
        setShowAlert({ visible: true, message: "Signup successful! Check your email for verification." });
      }
    } catch (err) {
      setShowAlert({
        visible: true,
        message: err.response?.data?.error || "Signup failed. Please try again.",
      });
    }
  };

  return (
    <div className='container mt-2'>
      {/* Alert at the top */}
      {showAlert.visible && (
        <Alert variant="success" className="text-center">
          {showAlert.message}
        </Alert>
      )}
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="card shadow-lg p-4" style={{ minWidth: "400px", borderRadius: '20px' }}>
          <h3 className="text-center mb-4">Sign Up</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label>Full Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <span className="text-danger">{errors.name.message}</span>}
            </div>
            <div className="mb-3">
              <label>Email:</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <span className="text-danger">{errors.email.message}</span>}
            </div>
            <div className="mb-3">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <span className="text-danger">{errors.password.message}</span>}
            </div>
            <div className="mb-3">
              <label>Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === getValues("password") || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && <span className="text-danger">{errors.confirmPassword.message}</span>}
            </div>
            <button type="submit" className="btn btn-success w-100">Sign Up</button>
          </form>
          <div className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/" className="text-primary">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
