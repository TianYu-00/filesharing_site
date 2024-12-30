import React, { useState, useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import CookieBanner from "./components/CookieNotice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LazyPageLoader from "./components/LazyPageLoader";

// https://react.dev/reference/react/lazy
const Landing_Home = lazy(() => import("./pages/Landing_Home"));
const Landing_Download = lazy(() => import("./pages/Landing_Download"));
const Landing_AccountSettings = lazy(() => import("./pages/Landing_AccountSettings"));
const Landing_ForgotPassword = lazy(() => import("./pages/Landing_ForgotPassword"));
const Landing_ResetPassword = lazy(() => import("./pages/Landing_ResetPassword"));
const Landing_MyFiles = lazy(() => import("./pages/Landing_MyFiles"));
const Landing_LoginRegistration = lazy(() => import("./pages/Landing_LoginRegistration"));
const Landing_Playground = lazy(() => import("./pages/Landing_Playground"));

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    // console.log(theme);
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
          theme={theme}
          transition:Bounce
        />
        <div className={theme}>
          <div className="min-h-screen">
            <Header toggleTheme={toggleTheme} theme={theme} />
            <Suspense fallback={<LazyPageLoader delay={300} />}>
              <Routes>
                <Route path="/" element={<Landing_Home />} />
                <Route path="/home" element={<Landing_Home />} />
                <Route path="/auth" element={<Landing_LoginRegistration />} />
                <Route path="/account" element={<Landing_AccountSettings />} />
                <Route path="/password-reset" element={<Landing_ForgotPassword />} />
                <Route path="/password-reset-confirm" element={<Landing_ResetPassword />} />
                <Route path="/files/download/:file_id" element={<Landing_Download />} />
                <Route path="/my-files" element={<Landing_MyFiles />} />
                <Route path="/playground" element={<Landing_Playground />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
