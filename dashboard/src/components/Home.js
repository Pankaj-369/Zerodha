import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import PrivateRoute from "./PrivateRoute";

const Home = () => {
  const [initialized, setInitialized] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      setFlashMessage("Logged in successfully");
      setTimeout(() => {
        setFlashMessage("");
      }, 3000);
    }

    setInitialized(true);
  }, []);

  if (!initialized) return <h3>Loading...</h3>;

  return (
    <PrivateRoute>

      <TopBar />
      {flashMessage && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "10px 20px",
          borderRadius: "4px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          zIndex: 9999,
        }}>
          {flashMessage}
        </div>
      )}
      <Dashboard />
    </PrivateRoute>
  );
};

export default Home;
