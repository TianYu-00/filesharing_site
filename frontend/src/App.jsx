import React from "react";
import Landing_Home from "./pages/Landing_Home";
import Landing_Download from "./pages/Landing_Download";
import Landing_Register from "./pages/Landing_Register";
import Landing_Login from "./pages/Landing_Login";
import Landing_AccountSettings from "./pages/Landing_AccountSettings";
import Header from "./components/Header";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing_Home />} />
          <Route path="/home" element={<Landing_Home />} />
          <Route path="/register" element={<Landing_Register />} />
          <Route path="/login" element={<Landing_Login />} />
          <Route path="/account" element={<Landing_AccountSettings />} />
          <Route path="/files/download/:file_id" element={<Landing_Download />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
