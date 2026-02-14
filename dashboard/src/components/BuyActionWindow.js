import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { formatUSD } from "../utils/formatters";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const BuyActionWindow = ({ uid, currentPrice }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(currentPrice || 0);
  const [orderType, setOrderType] = useState("MARKET");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState("GTC");
  const generalContext = useContext(GeneralContext);

  const marginRequired = stockQuantity * stockPrice;

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

    if ((orderType === "LIMIT" || orderType === "STOP") && stockPrice <= 0) {
      setError("Please enter valid trigger price.");
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

      const res = await axios.post(`${backendUrl}/orders/new`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        alert(
          orderType === "MARKET"
            ? "Market order executed successfully!"
            : `${orderType} order placed successfully!`
        );
        generalContext.closeBuyWindow();
        window.location.reload();
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
            className={`btn ${orderType === "MARKET" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleOrderTypeChange("MARKET")}
          >
            Market
          </button>
          <button
            type="button"
            className={`btn ${orderType === "LIMIT" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleOrderTypeChange("LIMIT")}
          >
            Limit
          </button>
          <button
            type="button"
            className={`btn ${orderType === "STOP" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleOrderTypeChange("STOP")}
          >
            Stop
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

      {orderType === "MARKET" && (
        <div className="alert alert-info py-2 text-center">
          Order will execute at current market price: {formatUSD(currentPrice || 0)}
        </div>
      )}
      <div className="mb-3">
        <label className="form-label fw-semibold">Duration</label>
        <select className="form-select" value={product} onChange={(e) => setProduct(e.target.value)}>
          <option value="DAY">Day Order</option>
          <option value="GTC">GTC (Good Till Cancelled)</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Quantity</label>
        <input
          type="number"
          className="form-control"
          value={stockQuantity}
          min="1"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || Number(val) >= 1) {
              setStockQuantity(val);
            }
          }}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">
          {orderType === "MARKET" ? "Current Price (USD)" : "Trigger Price (USD)"}
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
        Estimated order value: {formatUSD(marginRequired)}
      </div>

      <div className="d-flex justify-content-between">
        <button className="btn btn-primary w-50 me-2" onClick={handleBuyClick} disabled={loading}>
          {loading ? "Processing..." : orderType === "MARKET" ? "Buy at Market" : "Place Order"}
        </button>
        <button className="btn btn-outline-secondary w-50" onClick={handleCancelClick}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BuyActionWindow;
