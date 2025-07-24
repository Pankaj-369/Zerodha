import React, { useContext, useState, useEffect } from "react";
import { Tooltip, Grow, Menu, MenuItem } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import axios from 'axios';
import GeneralContext from "./GeneralContext";
import { DoughnutChart } from "./DoughnutChart";
import "./watchlist.css";
import { useNavigate } from "react-router-dom";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load watchlist initially
  useEffect(() => {
    axios.get(`${backendUrl}/watchlist`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then((res) => setWatchlist(res.data));
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchText.trim()) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const res = await axios.get(
          `${backendUrl}/search/symbols?q=${encodeURIComponent(searchText)}`
        );
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      }
      setLoadingSuggestions(false);
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // Add a stock to watchlist
  const handleAddToWatchList = async (stock) => {
    try {
      const res = await axios.post(
        `${backendUrl}/watchlist/add`,
        {
          symbol: stock.symbol,
          name: stock.name,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        if (!watchlist.find((s) => s.symbol === stock.symbol)) {
          setWatchlist((prev) => [...prev, stock]);
        }
      } else {
        alert(res.data.message || "Already exists");
      }

      setSearchText("");
      setSuggestions([]);
    } catch (err) {
      console.error("Add failed", err);
      alert("Failed to add to watchlist");
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`${backendUrl}/watchlist/remove`, {
        data: { symbol },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error("Remove failed", err);
      alert("Failed to remove from watchlist");
    }
  };

  const labels = watchlist.map(item => item.symbol);
  const data = {
    labels,
    datasets: [{
      label: 'Price',
      data: watchlist.map(item => item.price),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 0.9)', 'rgba(54, 162, 235, 0.9)',
        'rgba(255, 206, 86, 0.9)', 'rgba(75, 192, 192, 0.9)',
        'rgba(153, 102, 255, 0.9)', 'rgba(255, 159, 64, 0.9)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container" style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              handleAddToWatchList(suggestions[0]);
            }
          }}
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
          autoComplete="off"
        />
        <span className="counts">{watchlist.length} / 50</span>

        {searchText && suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((stock) => (
              <li
                key={stock.symbol}
                onMouseDown={() => handleAddToWatchList(stock)}
                style={{ cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}
              >
                <strong>{stock.symbol}</strong>
                <span style={{ fontSize: 12, color: "#888" }}>{stock.name}</span>
              </li>
            ))}
          </ul>
        )}

        {loadingSuggestions && <div className="autocomplete-loading">Loading…</div>}
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => (
          <WatchListItem
            key={index}
            stock={stock}
            onRemove={handleRemoveFromWatchlist}
          />
        ))}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showActions, setShowActions] = useState(false);
  return (
    <li
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="item">
        <p style={{ fontWeight: "450" }} className={stock.isDown ? "down" : "up"}>
          {stock.symbol}
        </p>
        <div className="itemInfo">
          <span className="percent">{(stock.percent)?.toFixed(2)}%</span>
          {stock.isDown ? <KeyboardArrowDown className="down" /> : <KeyboardArrowUp className="up" />}
          <span className="price">₹{stock.price?.toFixed(2)}</span>
        </div>
      </div>
      {showActions && <WatchListActions uid={stock.symbol} currentPrice={stock?.price} onRemove={onRemove} />}
    </li>
  );
};

const WatchListActions = ({ uid, currentPrice, onRemove }) => {
  const generalContext = useContext(GeneralContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <span className="actions">
      <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
        <button className="buy" onClick={() => generalContext.openBuyWindow(uid, currentPrice)}>Buy</button>
      </Tooltip>
      <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
        <button className="sell" onClick={() => generalContext.openSellWindow(uid, currentPrice)}>Sell</button>
      </Tooltip>
      <Tooltip title="Analytics (A)" placement="top" arrow>
        <button className="action" onClick={() => navigate(`/analytics/${uid}`)}>
          <BarChartOutlined className="icon" />
        </button>
      </Tooltip>
      <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
        <button className="action" onClick={handleClick}>
          <MoreHoriz className="icon" />
        </button>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => {
          onRemove(uid);
          handleClose();
        }}>
          Remove from Watchlist
        </MenuItem>
      </Menu>
    </span>
  );
};
