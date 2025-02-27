import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle form submission
  const onSubmit = async (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    try {
      // Send login request to backend
      const res = await axios.post(`${apiBaseUrl}/user/login`, userInfo, {
        withCredentials: true, // Ensure cookies are sent and received
      });

      // Check login response
      if (res.data.success) {
        toast.success("Login successful!");

        // Save user info and token in localStorage
        localStorage.setItem("Users", JSON.stringify(res.data.data.user.name));
        localStorage.setItem("Email",res.data.data.user.email);
        localStorage.setItem("authToken", res.data.token); // Save token
        localStorage.setItem("role", res.data.data.user.role); // Save user role

        // Navigate based on user role
        setTimeout(() => {

          const role = res.data.data.user.role;
          switch (role) {
            case "ADMIN":
              navigate("/admin");
              window.location.reload();
              break;
            case "CUSTOMER":
              navigate("/customer");
              window.location.reload();
              break;
            case "DELIVERY_AGENT":
              navigate("/delivery-dashboard");
              window.location.reload();
              break;
            default:
              toast.error("Unknown user role!");
          }
        }, 1000);
      } else {
        toast.error(res.data.message || "Unknown user!");
      }
    } catch (err) {
      // Handle errors from backend
      if (err.response) {
        toast.error(err.response.data.message || "Login failed.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      {/* Toast Notifications */}
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <div className="mb-3">
            <label>Email:</label>
            <input
              type="email"
              className="form-control shadow-none"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <span className="text-danger">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-3 position-relative">
            <label>Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control shadow-none"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              style={{
                marginTop: "11px"
              }}
              className="btn btn-md position-absolute top-50 end-0 translate-middle-y me-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-success w-100 mb-3">
            Login
          </button>
          
          {/* Forgot Password and Signup Links */}
          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password" className="text-primary">
              Forgot Password?
            </Link>
          </div>
          <p className="text-center m-0">
            Not registered?{" "}
            <Link to="/signup" className="text-primary">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
