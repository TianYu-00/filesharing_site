import React from "react";
import logo from "../assets/logo.png";

function Page_BoilerPlate({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-center">
        <div className="max-w-[1000px] w-full p-8 text-center text-white rounded-2xl m-4 md:bg-neutral-900 md:shadow-lg">
          <div className="hidden md:flex justify-center mb-14 bg-blue-600 rounded-t-2xl">
            <img src={logo} alt="" className="p-6 max-w-full md:max-w-[500px]" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Page_BoilerPlate;
