import React, { useState, useEffect } from "react";
import Landing_Home from "./pages/Landing_Home";
import Landing_Download from "./pages/Landing_Download";
import Landing_AccountSettings from "./pages/Landing_AccountSettings";
import Landing_ForgotPassword from "./pages/Landing_ForgotPassword";
import Landing_ResetPassword from "./pages/Landing_ResetPassword";
import Landing_MyFiles from "./pages/Landing_MyFiles";
import Header from "./components/Header";
import Landing_LoginRegistration from "./pages/Landing_LoginRegistration";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import CookieBanner from "./components/CookieNotice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    console.log(theme);
  }, [theme]);

  return (
    <UserProvider>
      <BrowserRouter>
        <CookieBanner />
        <ToastContainer
          position="bottom-right"
          autoClose={3200}
          limit={3}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={true}
          theme="dark"
          transition:Bounce
        />
        <div className={theme}>
          <Header toggleTheme={toggleTheme} theme={theme} />
          <Routes>
            <Route path="/" element={<Landing_Home />} />
            <Route path="/home" element={<Landing_Home />} />
            <Route path="/auth" element={<Landing_LoginRegistration />} />
            <Route path="/account" element={<Landing_AccountSettings />} />
            <Route path="/password-reset" element={<Landing_ForgotPassword />} />
            <Route path="/password-reset-confirm" element={<Landing_ResetPassword />} />
            <Route path="/files/download/:file_id" element={<Landing_Download />} />
            <Route path="/my-files" element={<Landing_MyFiles />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
