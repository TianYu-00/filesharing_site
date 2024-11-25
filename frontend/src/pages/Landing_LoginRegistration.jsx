import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

function Landing_Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { userLogin, userRegister } = useUser();
  const navigate = useNavigate();

  const handleAuth = async (event) => {
    try {
      event.preventDefault();

      if (isLogin) {
        const loginResponse = await userLogin(email, password, rememberMe);
        if (!loginResponse.success) {
          toast.error(loginResponse.response.data.msg);
        } else {
          navigate("/home");
        }
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const registerResponse = await userRegister(username, email, password);
        if (!registerResponse.success) {
          toast.error(registerResponse.response.data.msg);
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      // console.log(error);
      toast.error("An unknown error occurred. Please try again");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-2">Welcome to DropBoxer</h1>
        <p className="text-center text-gray-600 mb-6">Login or create an account to get started</p>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`w-1/2 py-2 text-center font-semibold ${
              isLogin ? "border-b-2 border-black text-black" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 text-center font-semibold ${
              !isLogin ? "border-b-2 border-black text-black" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 focus:ring-black"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link to="/password-reset" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
          )}

          <button type="submit" className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-900">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          By continuing, you agree to our{" "}
          <Link to="#" className="text-blue-500 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default Landing_Auth;
