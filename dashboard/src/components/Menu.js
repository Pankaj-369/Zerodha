import React, { useState } from "react";
import { Link } from "react-router-dom";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3000/login";
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initials = user.username?.slice(0, 2).toUpperCase() || "TE";
  const username = user.username || "test";

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Orders", path: "/orders" },
    { name: "Holdings", path: "/holdings" },
    { name: "Positions", path: "/positions" },
    { name: "Funds", path: "/funds" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "40px"
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", marginRight: "75px", height: "50px" }}>
        <img
          src="logo.png"
          alt="logo"
          style={{
            width: "70px",
            height: "40px",
            objectFit: "contain"
          }}
        />
      </div>

      {/* Navigation Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            onClick={() => handleMenuClick(index)}
            style={{ textDecoration: "none", }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: selectedMenu === index ? "#007bff" : "transparent",
                color: selectedMenu === index ? "white" : "#333",
                fontWeight: selectedMenu === index ? 600 : 400,
                fontSize: "0.95rem",
                transition: "all 0.2s ease",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          position: "relative"
        }}
        onClick={handleProfileClick}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#6c757d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          {initials}
        </div>
        <span
          style={{
            color: "#333",
            fontWeight: "500",
            fontSize: "0.95rem",
            marginRight: "26px"
          }}
        >
          {username}
        </span>

        {isProfileDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: "0",
              marginTop: "8px",
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              padding: "8px",
              zIndex: 1000,
              minWidth: "120px"
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
