import "./auth.css";
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/login`, {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user)); 
      
     const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';
window.location.href = `${baseUrl}/?token=${res.data.token}&user=${encodeURIComponent(JSON.stringify(res.data.user))}`;

    } catch (err) {
      alert("Login failed: " + (err.response?.data?.msg || err.message));
      console.log(username,password);
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
      </form>
    </div>
  );
};

export default Login;
