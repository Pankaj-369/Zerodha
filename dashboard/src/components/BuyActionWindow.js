import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const BuyActionWindow = ({ uid, currentPrice }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(currentPrice || 0);
  const [orderType, setOrderType] = useState("MARKET");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState("CNC"); 
  const generalContext = useContext(GeneralContext);

  const marginRequired = stockQuantity * stockPrice;

  // Handle order type change
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === "MARKET") {
      setStockPrice(currentPrice);
    }
  };


  const handleBuyClick = async () => {
    if (stockQuantity <= 0) {
      setError("Please enter valid quantity.");
      return;
    }

    if (orderType === "LIMIT" && stockPrice <= 0) {
      setError("Please enter valid price for limit order.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: "BUY",
        orderType,
        product,
      };

      const res = await axios.post(
       `${backendUrl}/orders/new`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert(
          orderType === "MARKET"
            ? "Market order executed successfully!"
            : "Limit order placed successfully!"
        );
        generalContext.closeBuyWindow();
      } else {
        alert(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Error placing order.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div
      className="card shadow-lg p-4"
      style={{
        maxWidth: "420px",
        width: "500px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "15px",
        zIndex: 9999,
      }}
    >
      <h4 className="fw-bold text-center mb-3">Buy {uid}</h4>

      <div className="mb-3 d-flex justify-content-center">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${orderType === "MARKET" ? "btn-primary" : "btn-outline-primary"
              }`}
            onClick={() => handleOrderTypeChange("MARKET")}
          >
            Market Order
          </button>
          <button
            type="button"
            className={`btn ${orderType === "LIMIT" ? "btn-primary" : "btn-outline-primary"
              }`}
            onClick={() => handleOrderTypeChange("LIMIT")}
          >
            Limit Order
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 text-center">{error}</div>
      )}

      {orderType === "MARKET" && (
        <div className="alert alert-info py-2 text-center">
          Order will execute at current market price: ₹{currentPrice?.toFixed(2) || "N/A"}
        </div>
      )}
      <div className="mb-3">
        <label className="form-label fw-semibold">Product Type</label>
        <select
          className="form-select"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        >
          <option value="CNC">Delivery</option>
          <option value="MIS">Intraday</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Quantity</label>
        <input
          type="number"
          className="form-control"
          value={stockQuantity}
          min="1"
          onChange={(e) => setStockQuantity(Number(e.target.value))}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">
          {orderType === "MARKET" ? "Current Price (₹)" : "Limit Price (₹)"}
        </label>
        <input
          type="number"
          className="form-control"
          value={stockPrice}
          min="0"
          step="0.01"
          onChange={(e) => setStockPrice(Number(e.target.value))}
          disabled={orderType === "MARKET"}
        />
      </div>

      <div className="mb-4 text-center text-muted fw-medium">
        Margin required: ₹{marginRequired.toFixed(2)}
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-primary w-50 me-2"
          onClick={handleBuyClick}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : orderType === "MARKET"
              ? "Buy at Market"
              : "Place Limit Order"}
        </button>
        <button
          className="btn btn-outline-secondary w-50"
          onClick={handleCancelClick}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BuyActionWindow;
