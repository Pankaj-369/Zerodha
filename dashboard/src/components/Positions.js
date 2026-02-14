import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { formatUSD } from "../utils/formatters";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios
      .get(`${backendUrl}/positions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setAllPositions(res.data));
  }, []);

  return (
    <>
      <h3 className="title">Positions ({allPositions.length})</h3>

      <div className="order-table">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Duration</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Buy Price</th>
              <th>LTP</th>
              <th>Current Value</th>
              <th>P&amp;L</th>
              <th>Chg.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((stock, index) => {
              const pnl = (stock.LTP - stock.price) * stock.qty;
              const isProfit = pnl >= 0;
              const profClass = isProfit ? "profit" : "loss";
              const day = stock.LTP - stock.price;
              const dayClass = day >= 0 ? "profit" : "loss";
              const currentValue = stock.LTP * stock.qty;
              const pnlPercent = ((stock.LTP - stock.price) / stock.price) * 100;
              const dropdownId = `positionsDropdown${index}`;

              return (
                <tr key={index}>
                  <td>{stock.product}</td>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{formatUSD(stock.price)}</td>
                  <td>{formatUSD(stock.LTP)}</td>
                  <td>{formatUSD(currentValue)}</td>
                  <td className={profClass}>
                    {formatUSD(pnl)} ({pnlPercent.toFixed(2)}%)
                  </td>
                  <td className={dayClass}>{formatUSD(day)}</td>
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
                        onMouseOver={(e) => (e.currentTarget.style.color = "#222")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        <span style={{ fontWeight: "bold", fontSize: 22 }}>...</span>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={dropdownId}
                        style={{ minWidth: "7rem" }}
                      >
                        <li>
                          <button
                            className="dropdown-item text-success fw-semibold"
                            style={{ fontWeight: 500, borderRadius: "3px" }}
                            onClick={() => generalContext.openBuyWindow(stock.name, stock.LTP)}
                          >
                            <span style={{ fontWeight: "bold" }}>Buy</span>
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger fw-semibold"
                            style={{ fontWeight: 500, borderRadius: "3px" }}
                            onClick={() =>
                              generalContext.openSellWindow(stock.name, stock.LTP, "positions", stock)
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
    </>
  );
};

export default Positions;
