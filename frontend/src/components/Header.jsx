import React, { useState } from "react";
import logo from "../assets/logo_simple.png";
import { Link } from "react-router-dom";
import { BsList } from "react-icons/bs";

function Header() {
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const handle_MenuClick = () => {
    setIsMenuClicked(!isMenuClicked);
  };

  return (
    <div
      className={` w-screen absolute transition-all duration-700 ease-in-out ${
        isMenuClicked ? "max-h-screen" : "max-h-20"
      } bg-neutral-900`}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 hidden md:block">
          <img src={logo} className="h-10" alt="Logo" />
        </div>
        <div className="flex-grow flex items-center justify-end text-white ">
          <button onClick={handle_MenuClick} className="hover:text-blue-500">
            <BsList size={30} />
          </button>
        </div>
      </div>
      <div
        className={`text-white w-full transition-all duration-700 ease-in-out ${
          isMenuClicked ? "h-[calc(100vh-4.7rem)]" : "h-0"
        } overflow-hidden`}
      >
        <ul className="space-y-1 flex flex-col items-center pt-5">
          {/* Login */}
          <li className="w-full">
            <Link to="#" className="hover:bg-neutral-700 w-full flex justify-center p-2" onClick={handle_MenuClick}>
              Login
            </Link>
          </li>

          {/* Register */}
          <li className="w-full">
            <Link to="#" className="hover:bg-neutral-700 w-full flex justify-center p-2" onClick={handle_MenuClick}>
              Register
            </Link>
          </li>

          <li className="w-full border border-neutral-800 m-5"></li>

          {/* Home */}
          <li className="w-full">
            <Link to="/" className="hover:bg-neutral-700 w-full flex justify-center p-2" onClick={handle_MenuClick}>
              Home
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Header;
