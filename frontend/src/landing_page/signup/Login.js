import "./auth.css";
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";
  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

  const redirectToDashboard = (payload) => {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload.user));
    window.location.href = `${baseUrl}/?token=${payload.token}&user=${encodeURIComponent(
      JSON.stringify(payload.user)
    )}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/login`, {
        username,
        password,
      });
      redirectToDashboard(res.data);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await axios.post(`${backendUrl}/login/guest`);
      redirectToDashboard(res.data);
    } catch (err) {
      alert("Guest login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <button type="button" onClick={handleGuestLogin}>
          Continue as Guest
        </button>
      </form>
    </div>
  );
};

export default Login;
