import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext.js";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios
      .get("http://localhost:3002/holdings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setAllHoldings(res.data))
      .catch((err) => console.error(err));
  }, []);

  const labels = allHoldings.map((item) => item.symbol);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price || 0),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>
      <div className="order-table">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
              <th></th> 
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const qty = stock.qty || 0;
              const avg = parseFloat(stock.avg || 0);
              const price = parseFloat(stock.price || 0);
              const curValue = price * qty;
              const pnl = curValue - avg * qty;

              const isProfit = pnl >= 0;
              const profClass = isProfit ? "profit" : "loss";

              const net = stock.net ?? "0.00";
              const day = stock.day ?? "0.00";
              const dayClass = day.startsWith("-") ? "loss" : "profit";
              const netClass = net.startsWith("-") ? "loss" : "profit";

              const dropdownId = `actionsDropdown${index}`;

              return (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{qty}</td>
                  <td>{avg.toFixed(2)}</td>
                  <td>{price.toFixed(2)}</td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>{pnl.toFixed(2)}</td>
                  <td className={netClass}>{net}</td>
                  <td className={dayClass}>{day}</td>
                  <td style={{ minWidth: 48, textAlign: "center" }}>
                    <div className="dropdown">
                      <button
                        className="btn p-0 border-0 bg-transparent"
                        type="button"
                        id={dropdownId}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        title="Actions"
                        style={{
                          fontSize: 20,
                          color: "#555",
                          transition: "color 0.2s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.color = "#222")}
                        onMouseOut={e => (e.currentTarget.style.color = "#555")}
                      >
                        <span style={{ fontWeight: "bold", fontSize: 22 }}>⋮</span>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={dropdownId}
                        style={{ minWidth: "7rem" }}
                      >
                        <li>
                          <button
                            className="dropdown-item text-success fw-semibold"
                            style={{ fontWeight: 500, borderRadius: '3px' }}
                            onClick={() =>
                              generalContext.openBuyWindow(stock.symbol, stock.price)
                            }
                          >
                            <span style={{ fontWeight: "bold" }}>Buy</span>
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger fw-semibold"
                            style={{ fontWeight: 500, borderRadius: '3px' }}
                            onClick={() =>
                              generalContext.openSellWindow(stock.symbol, stock.price)
                            }
                          >
                            <span style={{ fontWeight: "bold" }}>Sell</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

     {(() => {
  const totalInvestment = allHoldings.reduce((acc, stock) => acc + (stock.avg || 0) * (stock.qty || 0), 0);
  const currentValue = allHoldings.reduce((acc, stock) => acc + (stock.price || 0) * (stock.qty || 0), 0);
  const pnl = currentValue - totalInvestment;
  const pnlPercent = totalInvestment !== 0 ? (pnl / totalInvestment) * 100 : 0;
  const pnlClass = pnl >= 0 ? "profit" : "loss";

  return (
    <div className="row">
      <div className="col">
        <h5>₹{totalInvestment.toFixed(2)}</h5>
        <p>Total investment</p>
      </div>
      <div className="col">
        <h5 className={pnlClass}>₹{currentValue.toFixed(2)}</h5>
        <p>Current value</p>
      </div>
      <div className="col">
        <h5 className={pnlClass}>
          ₹{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
        </h5>
        <p>P&L</p>
      </div>
    </div>
  );
})()}


      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;
