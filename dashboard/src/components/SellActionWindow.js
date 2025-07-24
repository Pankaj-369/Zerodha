import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

// Header section
const ModalHeader = ({ uid, onClose }) => (
  <div className="d-flex justify-content-between align-items-center mb-2">
    <h4 className="fw-bold text-center flex-grow-1 mb-0">Sell {uid}</h4>
    <button className="btn-close" style={{ fontSize: 12 }} onClick={onClose}></button>
  </div>
);

// Info (Available, Avg Price)
const HoldingInfo = ({ availableQty, avgPrice }) => (
  <div className="alert alert-light py-2 mb-2">
    <div className="d-flex justify-content-between small">
      <span>Available:</span>
      <span className="fw-bold">{availableQty} shares</span>
    </div>
    <div className="d-flex justify-content-between small">
      <span>Avg. Price:</span>
      <span>₹{avgPrice?.toFixed(2)}</span>
    </div>
  </div>
);

// Toggle Order Type
const OrderTypeToggle = ({ orderType, setOrderType, currentPrice }) => (
  <div className="mb-2 d-flex justify-content-center gap-2">
    <button
      type="button"
      className={`btn btn-sm ${orderType === "MARKET" ? "btn-primary" : "btn-outline-primary"}`}
      onClick={() => setOrderType("MARKET")}
      style={{ minWidth: 95 }}
    >
      Market Order
    </button>
    <button
      type="button"
      className={`btn btn-sm ${orderType === "LIMIT" ? "btn-primary" : "btn-outline-primary"}`}
      onClick={() => setOrderType("LIMIT")}
      style={{ minWidth: 95 }}
    >
      Limit Order
    </button>
  </div>
);

const SellActionWindow = ({
  uid,
  currentPrice,
  mode = "holdings",
  position // for positions mode
}) => {
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockPrice, setStockPrice] = useState(currentPrice || 0);
  const [orderType, setOrderType] = useState("MARKET");
  const [availableQty, setAvailableQty] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [holdingsLoading, setHoldingsLoading] = useState(mode === "holdings");

  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    if (mode === "positions" && position) {
      setAvailableQty(position.qty);
      setAvgPrice(position.price);
      setStockQuantity(position.qty);
      setStockPrice(position.LTP);
      setHoldingsLoading(false);
    }
  }, [mode, position]);

  useEffect(() => {
    if (mode === "holdings") {
      const fetchHoldings = async () => {
        setHoldingsLoading(true);
        try {
          const res = await axios.get("http://localhost:3002/holdings", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const holding = res.data.find(h => h.symbol === uid);
          if (holding) {
            setAvailableQty(holding.qty);
            setAvgPrice(holding.avg);
          } else {
            setAvailableQty(0);
            setAvgPrice(0);
          }
        } catch (err) {
          setAvailableQty(0);
          setAvgPrice(0);
        } finally {
          setHoldingsLoading(false);
        }
      };
      fetchHoldings();
    }
  }, [uid, mode]);

  useEffect(() => {
    if (orderType === "MARKET" && currentPrice) {
      setStockPrice(currentPrice);
    }
  }, [currentPrice, orderType]);

  const totalValue = stockQuantity * stockPrice;
  const profitLoss = (stockPrice - avgPrice) * stockQuantity;
  const tooMuch = stockQuantity > availableQty;

  // Handler
  const handleSellClick = async (e) => {
    e.preventDefault();
    setError("");
    if (stockQuantity <= 0) { setError("Enter valid quantity."); return; }
    if (tooMuch) { setError(`Insufficient quantity. Available: ${availableQty}`); return; }
    if (orderType === "LIMIT" && stockPrice <= 0) { setError("Enter valid limit price."); return; }
    setLoading(true);

    // Position square-off
    if (mode === "positions" && position) {
      try {
        const orderData = {
          positionId: position._id,
          name: position.name,
          qty: Number(stockQuantity),
          price: Number(stockPrice),
          orderType,
          isPositionSell: true,
          mode: "SELL", 
        };
        const res = await axios.post(
          "http://localhost:3002/orders/new", orderData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.data.success) {
          alert("Position squared off successfully!");
          generalContext.closeSellWindow();
        } else setError(res.data.message || "Failed to square off position");
      } catch (err) {
        setError(err?.response?.data?.message || "Error squaring off position");
      } finally { setLoading(false); }
      return;
    }

    // Holdings sell
    if (mode === "holdings") {
      try {
        const orderData = {
          name: uid, qty: Number(stockQuantity), price: Number(stockPrice),
          mode: "SELL", orderType, symbol: uid
        };
        const res = await axios.post(
          "http://localhost:3002/orders/new", orderData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.data.success) {
          alert(
            orderType === "MARKET"
              ? "Market sell order executed successfully!"
              : "Limit sell order placed successfully!"
          );
          generalContext.closeSellWindow();
        } else setError(res.data.message || "Failed to place order");
      } catch (err) {
        setError(err?.response?.data?.message || "Error placing order");
      } finally { setLoading(false); }
    }
  };

  // Show spinner while fetching
  if (holdingsLoading) {
    return (
      <div className="card shadow-lg p-3" style={modalStyle}>
        <ModalHeader uid={uid} onClose={generalContext.closeSellWindow} />
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <span className="ms-2">Loading your holdings...</span>
        </div>
      </div>
    );
  }

  // No shares, holdings mode
  if (mode === "holdings" && availableQty === 0) {
    return (
      <div className="card shadow-lg p-3" style={modalStyle}>
        <ModalHeader uid={uid} onClose={generalContext.closeSellWindow} />
        <div className="alert alert-warning text-center mb-4">
          <h5>No shares available to sell</h5>
          <p className="mb-0">You need to buy {uid} shares first before you can sell them.</p>
        </div>
        <button
          className="btn btn-outline-secondary w-100"
          onClick={generalContext.closeSellWindow}
        >Close</button>
      </div>
    );
  }

  return (
    <div
      className="card shadow-lg p-3"
      style={modalStyle}
    >
      <ModalHeader uid={uid} onClose={generalContext.closeSellWindow} />
      {/* Scrollable section for all content except action buttons */}
      <form style={{ maxHeight: 370, overflowY: "auto" }} onSubmit={handleSellClick}>
        <HoldingInfo availableQty={availableQty} avgPrice={avgPrice} />
        <OrderTypeToggle orderType={orderType} setOrderType={setOrderType} currentPrice={currentPrice} />
        {orderType === "MARKET" && (
          <div className="alert alert-info py-2 text-center mb-2" style={{ fontSize: 13 }}>
            Order will execute at current market price: ₹{stockPrice?.toFixed(2)}
          </div>
        )}
        <div
          className="alert text-danger text-center py-1 mb-2"
          style={{
            minHeight: 24,
            fontSize: 13,
            paddingTop: "2px",
            paddingBottom: "2px",
            visibility: error ? "visible" : "hidden",
            background: "none",
            border: "none"
          }}
        >
          {error || <span>&nbsp;</span>}
        </div>
        <div className="mb-2">
          <label className="form-label fw-semibold mb-0 small">Quantity</label>
          <input
            type="number"
            className="form-control form-control-sm"
            value={stockQuantity}
            max={availableQty}
            min="1"
            autoFocus
            style={{ height: 32 }}
            onChange={e => {
              setError("");
              setStockQuantity(Number(e.target.value));
            }}
          />
        </div>
        <div className="mb-2">
          <label className="form-label fw-semibold mb-0 small">
            {orderType === "MARKET" ? "Current Price (₹)" : "Limit Price (₹)"}
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            value={stockPrice}
            min="0"
            step="0.01"
            style={{ height: 32 }}
            onChange={e => setStockPrice(Number(e.target.value))}
            disabled={orderType === "MARKET"}
          />
        </div>
        {(stockQuantity > 0 && stockQuantity <= availableQty) && (
          <div className="mb-2 p-2 bg-light rounded small">
            <div className="d-flex justify-content-between">
              <span>Selling:</span>
              <span>{stockQuantity} shares</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Price per share:</span>
              <span>₹{stockPrice.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold border-top pt-1">
              <span>Total Value:</span>
              <span>₹{totalValue.toFixed(2)}</span>
            </div>
            <div className={`d-flex justify-content-between ${profitLoss >= 0 ? "text-success" : "text-danger"}`}>
              <span>P&L:</span>
              <span>{profitLoss >= 0 ? "+" : ""}₹{profitLoss.toFixed(2)}</span>
            </div>
          </div>
        )}
      </form>
      {/* Action buttons PERSISTENT at bottom */}
      <div className="d-flex justify-content-between gap-2 mt-2">
        <button
          className="btn btn-danger flex-grow-1"
          style={{ minWidth: 0 }}
          onClick={handleSellClick}
          disabled={loading || stockQuantity <= 0 || stockQuantity > availableQty || !!error}
        >
          {loading
            ? "Processing..."
            : orderType === "MARKET"
            ? "Sell at Market"
            : "Place Limit Order"}
        </button>
        <button
          className="btn btn-outline-secondary flex-grow-1"
          style={{ minWidth: 0 }}
          onClick={generalContext.closeSellWindow}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Modal style
const modalStyle = {
  maxWidth: "385px",
  width: "96vw",
  position: "fixed",
  top: "48%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "13px",
  zIndex: 9999,
  minHeight: "345px",
  boxSizing: "border-box"
};

export default SellActionWindow;
