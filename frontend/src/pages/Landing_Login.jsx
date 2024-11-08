import React from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { Link } from "react-router-dom";

function Landing_Login() {
  const handle_Login = (event) => {
    event.preventDefault();
    console.log("Login button clicked!");
  };
  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <form
          className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black"
          onSubmit={handle_Login}
        >
          <div className="flex flex-col">
            <p className="text-left font-bold text-3xl">Log In</p>
            <p className="text-left ">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Username</label>
            <input className="border p-2 border-black rounded" type="text" placeholder="tian" autoComplete="username" />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Password</label>
            <input className="border p-2 border-black rounded" type="password" autoComplete="current-password" />
          </div>

          <div className="flex flex-row">
            <label className="flex items-center mr-auto">
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <span className="font-semibold select-none">Remember me</span>
            </label>
            <Link to="#" className="flex ml-auto text-blue-500">
              Forgot Login Info?
            </Link>
          </div>

          <button className="w-full border border bg-black text-white font-semibold p-2 rounded" type="submit">
            Login
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_Login;
