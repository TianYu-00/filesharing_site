import React, { useState, useEffect } from "react";
import logoBlack from "../assets/logo-no-background-black-simple-cropped.svg";
import logoWhite from "../assets/logo-no-background-white-simple-cropped.svg";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import PageLoader from "./PageLoader";
import { TbUser, TbHome, TbFileSmile, TbSettings, TbLogout, TbLogin } from "react-icons/tb";
import ThemeSwitcher from "./ThemeSwitcher";
import DropdownMenu from "./DropdownMenu";

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
              <div className="">
                <button onClick={handle_MenuClick} className="mx-2 p-2 hover:bg-background-opp/10 rounded">
                  <TbUser size={25} className={`${theme === "dark" ? "text-white" : "text-black"}`} />
                </button>
                <DropdownMenu isOpen={isMenuClicked} setIsOpen={setIsMenuClicked}>
                  <div className="text-copy-primary">
                    <div>
                      {user ? (
                        <div>
                          <p className="font-medium whitespace-nowrap overflow-hidden truncate">{user?.username}</p>
                          <p className="text-copy-secondary text-sm whitespace-nowrap overflow-hidden truncate">
                            {user?.email}
                          </p>
                        </div>
                      ) : (
                        <Link
                          to="/auth"
                          className="flex flex-row p-2 hover:bg-background-opp hover:text-copy-opp rounded"
                          onClick={handle_MenuClick}
                        >
                          <TbLogin size={17} />
                          <span className="font-medium text-sm pl-2">Login/Register</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-b border-border/30 my-2" />
                    <div className="">
                      <ul className="space-y-1 flex flex-col">
                        <li className="w-full hover:bg-background-opp hover:text-copy-opp rounded">
                          <Link to="/" className="flex flex-row p-2" onClick={handle_MenuClick}>
                            <TbHome size={17} />
                            <span className="font-medium text-sm pl-2">Home</span>
                          </Link>
                        </li>

                        {user && (
                          <li className="w-full hover:bg-background-opp hover:text-copy-opp rounded">
                            <Link to="/my-files" className="flex flex-row p-2" onClick={handle_MenuClick}>
                              <TbFileSmile size={17} />
                              <span className="font-medium text-sm pl-2">My Files</span>
                            </Link>
                          </li>
                        )}

                        {user && (
                          <li className="w-full hover:bg-background-opp hover:text-copy-opp rounded">
                            <Link to="/account" className="flex flex-row p-2" onClick={handle_MenuClick}>
                              <TbSettings size={17} />
                              <span className="font-medium text-sm pl-2">Account Settings</span>
                            </Link>
                          </li>
                        )}

                        {user && (
                          <li className="w-full">
                            <div className="border-b border-border/30" />
                          </li>
                        )}

                        {user && (
                          <li className="w-full hover:bg-background-opp hover:text-copy-opp rounded">
                            <Link
                              to="/home"
                              className="flex flex-row p-2"
                              onClick={() => {
                                handle_MenuClick();
                                userLogout();
                              }}
                            >
                              <TbLogout size={17} />
                              <span className="font-medium text-sm pl-2">Logout</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Menu */}
        </div>
      </div>
    </PageLoader>
  );
}

export default Header;
