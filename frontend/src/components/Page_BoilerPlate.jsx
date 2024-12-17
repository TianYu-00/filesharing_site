import React from "react";
import logoNoBackground from "../assets/logo-no-background-white.svg";

function Page_BoilerPlate({ children }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6.5vh)]">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-center">
        <div className="max-w-[1000px] w-full p-8 text-center text-primary rounded-2xl m-4 md:bg-card md:shadow-lg">
          {/* image */}
          <div className="hidden md:flex justify-center mb-14 bg-cta rounded-t-2xl">
            <img src={logoNoBackground} alt="" className="p-6 max-w-full md:max-w-[800px]" />
            {/* <div className="p-6 max-w-full w-full md:max-w-[500px]">
              <h1 className="text-white/90 font-black text-7xl ">Dropboxer</h1>
              <h2 className="text-white/90 font-bold text-2xl mt-3">Select - Upload - Share</h2>
            </div> */}
          </div>
          {/* children  */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default Page_BoilerPlate;
