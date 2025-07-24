import React, { useState, useEffect, useContext } from "react";
import "./Summary.css";
import { TrendingUp, AttachMoney, AccountBalance, ShowChart } from '@mui/icons-material';
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const Summary = () => {
  const [stats, setStats] = useState({
    availableMargin: 0,
    usedMargin: 0,
    openingBalance: 0,
    pnl: 0,
    pnlPercent: 0,
    holdingsValue: 0,
    investment: 0,
    holdingsCount: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const generalContext = useContext(GeneralContext);

  // Mock performance data for the chart
  const mockPerformanceData = [
    { day: "Mon", pnl: 5000 },
    { day: "Tue", pnl: 8200 },
    { day: "Wed", pnl: 12000 },
    { day: "Thu", pnl: 9800 },
    { day: "Fri", pnl: 15500 },
    { day: "Today", pnl: 18900 }
  ];

  // Fetch only necessary dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch funds data
      const fundsResponse = await axios.get(`${backendUrl}/funds`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const { availableMargin, usedMargin, openingBalance } = fundsResponse.data;
      
      // Fetch holdings data
      const holdingsResponse = await axios.get(`${backendUrl}/holdings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Calculate portfolio metrics
      const holdingsValue = holdingsResponse.data.reduce((sum, holding) => 
        sum + (holding.qty * holding.price), 0); 
      const investment = holdingsResponse.data.reduce((sum, holding) => 
        sum + (holding.qty * holding.avg), 0);
      const pnl = holdingsValue - investment;
      const pnlPercent = investment > 0 ? ((pnl / investment) * 100).toFixed(2) : 0;
      
      setStats({
        availableMargin,
        usedMargin,
        openingBalance,
        pnl,
        pnlPercent,
        holdingsValue,
        investment,
        holdingsCount: holdingsResponse.data.length
      });
      
      // Set chart data
      setChartData(mockPerformanceData);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="sidebar">
        </div>
        <div className="main-content">
          <div className="loading-message">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="user-section">
          <div className="avatar">U</div>
          <div className="user-details">
            <h3>Hi, User!</h3>
            <p className="portfolio-value">₹{stats.holdingsValue.toLocaleString()}</p>
            <span className="user-status">Portfolio Value</span>
          </div>
        </div>
        
        <div className="today-summary">
          <h4>Today's Summary</h4>
          <div className="summary-item">
            <span className="label">P&L</span>
            <span className={`value ${stats.pnl >= 0 ? 'positive' : 'negative'}`}>
              {stats.pnl >= 0 ? '+' : ''}₹{Math.abs(stats.pnl).toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Change</span>
            <span className={`value ${stats.pnl >= 0 ? 'positive' : 'negative'}`}>
              {stats.pnl >= 0 ? '+' : ''}{stats.pnlPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon available">
              <ShowChart />
            </div>
            <div className="stat-info">
              <h5>Available Margin</h5>
              <h3>₹{stats.availableMargin.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon used">
              <AccountBalance />
            </div>
            <div className="stat-info">
              <h5>Margin Used</h5>
              <h3>₹{stats.usedMargin.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon balance">
              <AttachMoney />
            </div>
            <div className="stat-info">
              <h5>Opening Balance</h5>
              <h3>₹{stats.openingBalance.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="performance-chart">
          <h4>Weekly Performance Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
            >
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#3f51b5"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, fill: "#ff5722" }}
              />
              <XAxis dataKey="day" />
              <YAxis
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                labelFormatter={(label) => `Day: ${label}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="holdings-card">
          <div className="holdings-header">
            <h3>Holdings ({stats.holdingsCount})</h3>
            <div className={`pill ${stats.pnl >= 0 ? 'positive' : 'negative'}`}>
              {stats.pnl >= 0 ? '+' : ''}{stats.pnlPercent}%
            </div>
          </div>
          
          <div className="holdings-grid">
            <div className="holding-stat">
              <h5>Current Value</h5>
              <h3>₹{stats.holdingsValue.toLocaleString()}</h3>
            </div>
            
            <div className="holding-stat">
              <h5>Investment</h5>
              <h3>₹{stats.investment.toLocaleString()}</h3>
            </div>
            
            <div className="holding-stat">
              <h5>Total P&L</h5>
              <h3 className={`${stats.pnl >= 0 ? 'positive' : 'negative'}`}>
                {stats.pnl >= 0 ? '+' : ''}₹{Math.abs(stats.pnl).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
