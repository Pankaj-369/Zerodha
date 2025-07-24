import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${backendUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper function to get status styling
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: "2px 8px",
      borderRadius: "4px",
      fontWeight: "500",
      fontSize: "0.85rem",
      display: "inline-block",
      textAlign: "center",
      minWidth: "70px",
    };

    switch (status) {
      case "COMPLETED":
        return {
          ...baseStyle,
          color: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          border: "1px solid #28a745",
        };
      case "PENDING":
        return {
          ...baseStyle,
          color: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          border: "1px solid #ffc107",
        };
      case "EXPIRED":
        return {
          ...baseStyle,
          color: "#6c757d",
          backgroundColor: "rgba(108, 117, 125, 0.1)",
          border: "1px solid #6c757d",
        };
      case "CANCELLED":
        return {
          ...baseStyle,
          color: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          border: "1px solid #dc3545",
        };
      default:
        return {
          ...baseStyle,
          color: "#6c757d",
          backgroundColor: "rgba(108, 117, 125, 0.1)",
          border: "1px solid #6c757d",
        };
    }
  };

  return (
    <div className="orders">
      {isLoading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      ) : (
        <div className="order-table">
          <h2>Today's Orders ({orders.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Type</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>₹{order.price}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        color: order.mode === "BUY" ? "green" : "red",
                        backgroundColor: order.mode === "BUY" ? "rgba(0, 128, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
                        border: `1px solid ${order.mode === "BUY" ? "green" : "red"}`,
                        display: "inline-block",
                        width: "50px",
                        textAlign: "center",
                      }}
                    >
                      {order.mode}
                    </span>
                  </td>
                  <td>
                    <span style={getStatusStyle(order.status)}>
                      {order.status || "COMPLETED"}
                    </span>
                  </td>
                  <td>
                    {order.timestamp
                      ? new Date(order.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                      : "No Time"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
