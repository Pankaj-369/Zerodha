import { Route, Routes } from "react-router-dom";

import Funds from "./Funds";
import Holdings from "./Holdings";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StockAnalytics from "./StockAnalytics"; // new component

import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import { GeneralContextProvider } from "./GeneralContext";

const Logout = () => {
  <button class="nav-link active" aria-current="page" to={'/signup'}>
    Signup
  </button>
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  return null;
};



const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <GeneralContextProvider>
        <WatchList />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Summary />} />
            <Route path="/analytics/:symbol" element={<StockAnalytics />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </div>
      </GeneralContextProvider>
    </div>
  );
};


export default Dashboard;
