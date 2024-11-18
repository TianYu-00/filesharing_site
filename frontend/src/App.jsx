import React from "react";
import Landing_Home from "./pages/Landing_Home";
import Landing_Download from "./pages/Landing_Download";
import Landing_Register from "./pages/Landing_Register";
import Landing_Login from "./pages/Landing_Login";
import Landing_AccountSettings from "./pages/Landing_AccountSettings";
import Landing_ForgotPassword from "./pages/Landing_ForgotPassword";
import Landing_ResetPassword from "./pages/Landing_ResetPassword";
import Header from "./components/Header";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import CookieBanner from "./components/CookieNotice";

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <CookieBanner />
        <Routes>
          <Route path="/" element={<Landing_Home />} />
          <Route path="/home" element={<Landing_Home />} />
          <Route path="/register" element={<Landing_Register />} />
          <Route path="/login" element={<Landing_Login />} />
          <Route path="/account" element={<Landing_AccountSettings />} />
          <Route path="/password-reset" element={<Landing_ForgotPassword />} />
          <Route path="/password-reset-confirm" element={<Landing_ResetPassword />} />
          <Route path="/files/download/:file_id" element={<Landing_Download />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
