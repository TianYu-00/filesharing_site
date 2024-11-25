import React, { useState, useEffect } from "react";
import logo from "../assets/logo_simple.png";
import { Link, useNavigate } from "react-router-dom";
import { BsList } from "react-icons/bs";
import { useUser } from "../context/UserContext";
import { useSpring, animated } from "@react-spring/web";

function Header() {
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const { user, userLogout, userVerify } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    userVerify();
  }, []);

  const handle_MenuClick = () => {
    setIsMenuClicked(!isMenuClicked);
  };

  const menuAnimation = useSpring({
    height: isMenuClicked ? "94vh" : "0",
    opacity: isMenuClicked ? 1 : 0,
    overflow: "hidden",
  });

  return (
    <div className="w-full absolute bg-[#111313] z-50">
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 hidden md:block cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} className="h-10" alt="Logo" />
        </div>
        <div className="flex-grow flex items-center justify-end text-white">
          {user ? <div className="mr-5">Logged in as {user.username}</div> : <div className="mr-5">Not logged in</div>}
          <button onClick={handle_MenuClick} className="hover:text-blue-500">
            <BsList size={30} />
          </button>
        </div>
      </div>

      {/* Menu */}
      <animated.div style={menuAnimation} className="text-white w-full">
        <ul className="space-y-1 flex flex-col items-center pt-5">
          {!user && (
            <li className="w-full">
              <Link
                to="/auth"
                className="hover:bg-neutral-700 w-full flex justify-center p-2"
                onClick={handle_MenuClick}
              >
                Login / Register
              </Link>
            </li>
          )}

          {/* My Files */}
          {user && (
            <li className="w-full">
              <Link
                to="/my-files"
                className="hover:bg-neutral-700 w-full flex justify-center p-2"
                onClick={handle_MenuClick}
              >
                My Files
              </Link>
            </li>
          )}

          {/* Account Settings */}
          {user && (
            <li className="w-full">
              <Link
                to="/account"
                className="hover:bg-neutral-700 w-full flex justify-center p-2"
                onClick={handle_MenuClick}
              >
                Account Settings
              </Link>
            </li>
          )}

          {user && (
            <li className="w-full">
              <Link
                to="/home"
                className="hover:bg-neutral-700 w-full flex justify-center p-2"
                onClick={() => {
                  handle_MenuClick();
                  userLogout();
                }}
              >
                Log out
              </Link>
            </li>
          )}

          <li className="w-full border border-neutral-800 m-5"></li>

          {/* Home */}
          <li className="w-full">
            <Link to="/" className="hover:bg-neutral-700 w-full flex justify-center p-2" onClick={handle_MenuClick}>
              Home
            </Link>
          </li>
        </ul>
      </animated.div>
    </div>
  );
}

export default Header;
