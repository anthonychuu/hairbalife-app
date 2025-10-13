import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HairbalifePage from "./components/HairbalifePage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HairbalifePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;