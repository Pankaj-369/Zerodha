import React, { useState, useEffect } from "react";
import { formatUSD } from "../utils/formatters";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Funds = () => {
  const [funds, setFunds] = useState({
    available: 0,
    used: 0,
    opening: 0,
  });
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add");

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${backendUrl}/funds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setFunds({
      available: data.availableMargin,
      used: data.usedMargin,
      opening: data.openingBalance,
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const route = action === "add" ? "funds/add" : "funds/withdraw";

    const res = await fetch(`${backendUrl}/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await res.json();
    if (data.success) {
      fetchFunds();
    } else {
      alert(data.message || "Transaction failed");
    }
    setAmount("");
  };

  return (
    <div className="container-fluid px-5 py-4">
      <div className="mb-5 text-center">
        <h2 className="fw-bold">Fund Transfer</h2>
        <p className="text-muted">Add and withdraw funds using ACH, wire, and card transfers</p>

        <div className="d-flex justify-content-center gap-3 mt-3">
          <button
            className="btn btn-success px-4"
            data-bs-toggle="modal"
            data-bs-target="#fundModal"
            onClick={() => setAction("add")}
          >
            Add Funds
          </button>
          <button
            className="btn btn-outline-primary px-4"
            data-bs-toggle="modal"
            data-bs-target="#fundModal"
            onClick={() => setAction("withdraw")}
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="row gx-5">
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm p-4">
            <h4 className="fw-semibold mb-4">Equities</h4>

            <div className="mb-3 row">
              <div className="col-6">Available margin</div>
              <div className="col-6 text-end fw-bold">{formatUSD(funds.available)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Used margin</div>
              <div className="col-6 text-end">{formatUSD(funds.used)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Available cash</div>
              <div className="col-6 text-end">{formatUSD(funds.available)}</div>
            </div>

            <hr />

            <div className="mb-3 row">
              <div className="col-6">Opening Balance</div>
              <div className="col-6 text-end">{formatUSD(funds.opening)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Deposits</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>

            <div className="mb-3 row">
              <div className="col-6">Initial Margin</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Maintenance Margin</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Exposure</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Options premium</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>

            <hr />

            <div className="mb-3 row">
              <div className="col-6">Collateral (Cash Equivalents)</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Collateral (Securities)</div>
              <div className="col-6 text-end">{formatUSD(0)}</div>
            </div>
            <div className="row">
              <div className="col-6 fw-bold">Total Collateral</div>
              <div className="col-6 text-end fw-bold">{formatUSD(0)}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center p-4">
            <p className="mb-3">You do not have an options account enabled</p>
            <button className="btn btn-outline-primary">Enable Account</button>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="fundModal"
        tabIndex="-1"
        aria-labelledby="fundModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="fundModalLabel">
                {action === "add" ? "Add Funds" : "Withdraw Funds"}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount in USD"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funds;
