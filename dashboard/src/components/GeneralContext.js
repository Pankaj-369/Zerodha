import React, { useState } from "react";
import BuyActionWindow from "./BuyActionWindow";
import SellActionWindow from "./SellActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, currentPrice) => { },
  closeBuyWindow: () => { },
  openSellWindow: (uid, currentPrice, mode, position) => { },
  closeSellWindow: () => { },
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [isSellWindowOpen, setIsSellWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [currentPrice, setcurrentPrice] = useState("");
  const [sellMode, setSellMode] = useState("holdings"); // "holdings" or "positions"
  const [positionData, setPositionData] = useState(null);

  // Now can be used for both hodlings and positions
  const handleOpenSellWindow = (uid, currentPrice, mode = "holdings", position = null) => {
    setIsSellWindowOpen(true);
    setSelectedStockUID(uid);
    setcurrentPrice(currentPrice);
    setSellMode(mode);     // "holdings" or "positions"
    setPositionData(position); // If from positions, pass position object
  };

  const handleCloseSellWindow = () => {
    setIsSellWindowOpen(false);
    setSelectedStockUID("");
    setcurrentPrice("");
    setSellMode("holdings");
    setPositionData(null);
  };

  const handleOpenBuyWindow = (uid, currentPrice) => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setcurrentPrice(currentPrice);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
    setcurrentPrice("");
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
        openSellWindow: handleOpenSellWindow,
        closeSellWindow: handleCloseSellWindow,
      }}
    >
      {props.children}
      {isBuyWindowOpen && (
        <BuyActionWindow uid={selectedStockUID} currentPrice={currentPrice} />
      )}
      {isSellWindowOpen && (
        <SellActionWindow
          uid={selectedStockUID}
          currentPrice={currentPrice}
          mode={sellMode}
          position={positionData}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
