import React, { useState, useEffect } from "react";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Funds = () => {
  const [funds, setFunds] = useState({
    available: 0,
    used: 0,
    opening: 0,
  });
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("add"); // 'add' or 'withdraw'

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3002/funds", {
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

    const res = await fetch(`http://localhost:3002/${route}`, {
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
        <p className="text-muted">
          Add and withdraw funds using UPI, Netbanking, IMPS, and more
        </p>

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
        {/* Left - Equity */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm p-4">
            <h4 className="fw-semibold mb-4">Equity</h4>

            <div className="mb-3 row">
              <div className="col-6">Available margin</div>
              <div className="col-6 text-end fw-bold">
                ₹{funds.available.toFixed(2)}
              </div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Used margin</div>
              <div className="col-6 text-end">₹{funds.used?.toFixed(2)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Available cash</div>
              <div className="col-6 text-end">₹{funds.available?.toFixed(2)}</div>
            </div>

            <hr />

            <div className="mb-3 row">
              <div className="col-6">Opening Balance</div>
              <div className="col-6 text-end">₹{funds.opening?.toFixed(2)}</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Payin</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>

            <div className="mb-3 row">
              <div className="col-6">SPAN</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Delivery margin</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Exposure</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Options premium</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>

            <hr />

            <div className="mb-3 row">
              <div className="col-6">Collateral (Liquid funds)</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>
            <div className="mb-3 row">
              <div className="col-6">Collateral (Equity)</div>
              <div className="col-6 text-end">₹0.00</div>
            </div>
            <div className="row">
              <div className="col-6 fw-bold">Total Collateral</div>
              <div className="col-6 text-end fw-bold">₹0.00</div>
            </div>
          </div>
        </div>

        {/* Right - Commodity */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm text-center p-4">
            <p className="mb-3">You don't have a commodity account</p>
            <button className="btn btn-outline-primary">Open Account</button>
          </div>
        </div>
      </div>

      {/* Modal for Add/Withdraw */}
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
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleSubmit}
              >
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
