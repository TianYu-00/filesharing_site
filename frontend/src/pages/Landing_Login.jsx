import React, { useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function Landing_Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberMe, setIsRememberMe] = useState(false);
  const { userLogin } = useUser();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handle_Login = async (event) => {
    try {
      event.preventDefault();
      setMessage("");
      console.log("Login button clicked!");

      const loginResponse = await userLogin(email, password, isRememberMe);

      if (loginResponse.success) {
        navigate("/home");
      } else {
        const tmpMessage = loginResponse.response.data.msg;
        setMessage(tmpMessage);
      }
    } catch (error) {
      const tmpMessage = error.response?.data?.msg || "Sign in failed. Please try again.";
      setMessage(tmpMessage);
    }
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
            <label className="text-left font-semibold">Email</label>
            <input
              className="border p-2 border-black rounded"
              type="email"
              placeholder="123456789@dropboxer.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-left font-semibold">Password</label>
            <input
              className="border p-2 border-black rounded"
              type="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-row">
            <label className="flex items-center mr-auto">
              <input
                type="checkbox"
                id="rememberMe"
                className="mr-2"
                checked={isRememberMe}
                onChange={() => {
                  setIsRememberMe(!isRememberMe);
                }}
              />
              <span className="font-semibold select-none">Remember me</span>
            </label>
            <Link to="#" className="flex ml-auto text-blue-500">
              Forgot Login Info?
            </Link>
          </div>

          <div className="flex flex-col">
            <p className="text-red-500">{message}</p>
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
