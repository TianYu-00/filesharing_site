import React from "react";
import Landing_Home from "./pages/Landing_Home";
import Landing_Download from "./pages/Landing_Download";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing_Home />} />
        <Route path="/home" element={<Landing_Home />} />
        <Route path="/files/download/:file_id" element={<Landing_Download />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
