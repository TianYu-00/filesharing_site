import React, { useState, useEffect } from "react";
import logoBlack from "../assets/logo-no-background-black-simple-cropped.svg";
import logoWhite from "../assets/logo-no-background-white-simple-cropped.svg";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSpring, animated } from "@react-spring/web";
import PageLoader from "./PageLoader";
import { TbMenu2, TbUser } from "react-icons/tb";
import ThemeSwitcher from "./ThemeSwitcher";

function Header({ toggleTheme, theme }) {
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const { user, userLogout, userVerify, isLoadingUser } = useUser();
  const navigate = useNavigate();
  const [isLoadingHeader, setIsLoadingHeader] = useState(true);

  useEffect(() => {
    const verifyUserLogin = async () => {
      try {
        setIsLoadingHeader(true);
        await userVerify();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingHeader(false);
      }
    };
    verifyUserLogin();
  }, []);

  const handle_MenuClick = () => {
    setIsMenuClicked(!isMenuClicked);
  };

  return (
    <PageLoader isLoading={isLoadingHeader} timer={1500} message="Verifying User">
      <div className="max-w-full h-20 relative">
        <div className="w-full absolute z-50 h-full">
          <div className="flex items-center p-4 h-full border-b border-border/50">
            <div className="flex-shrink-0 hidden md:block cursor-pointer" onClick={() => navigate("/")}>
              {theme === "dark" ? (
                <img src={logoWhite} className="h-12" alt="Logo" />
              ) : (
                <img src={logoBlack} className="h-12" alt="Logo" />
              )}
            </div>
            <div className="flex-grow flex items-center justify-end text-white">
              <div className="mx-2 p-2 hover:bg-background-opp/10 rounded">
                <ThemeSwitcher isToggled={theme === "light"} toggleSwitch={toggleTheme} />
              </div>
              <button onClick={handle_MenuClick} className="mx-2 p-2 hover:bg-background-opp/10 rounded">
                <TbUser size={25} className={`${theme === "dark" ? "text-white" : "text-black"}`} />
              </button>
            </div>
          </div>

          {/* Menu */}
        </div>
      </div>
    </PageLoader>
  );
}

export default Header;
