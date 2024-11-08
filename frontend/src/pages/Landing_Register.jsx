import React from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";

function Landing_Register() {
  const handle_SignUp = (event) => {
    event.preventDefault();
    console.log("Sign up button clicked!");
  };
  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <form
          className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black"
          onSubmit={handle_SignUp}
        >
          <div className="flex flex-col">
            <p className="text-left font-bold text-3xl">Register</p>
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Username</label>
            <input className="border p-2 border-black rounded" type="text" placeholder="tian" autoComplete="username" />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Email</label>
            <input
              className="border p-2 border-black rounded"
              type="email"
              placeholder="123456789@dropboxer.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Password</label>
            <input className="border p-2 border-black rounded" type="password" autoComplete="current-password" />
          </div>

          <button className="w-full border border bg-black text-white font-semibold p-2 rounded" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_Register;
