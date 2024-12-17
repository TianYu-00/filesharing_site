import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import PasswordChecklistChecker from "../components/PasswordChecklistChecker";

function Landing_Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { userLogin, userRegister } = useUser();
  const navigate = useNavigate();
  const [isAttemptingToAuth, setIsAttemptingToAuth] = useState(false);
  const [isPasswordCheckAllPass, setIsPasswordCheckAllPass] = useState(false);

  const handleAuth = async (event) => {
    try {
      event.preventDefault();
      setIsAttemptingToAuth(true);
      if (isLogin) {
        // is logging in
        const loginResponse = await userLogin(email, password, rememberMe);
        if (!loginResponse.success) {
          toast.error(loginResponse.response.data.msg);
          setIsAttemptingToAuth(false);
        } else {
          navigate("/home");
        }
      } else {
        // is registering
        if (!isPasswordCheckAllPass) {
          toast.error("Password requirements not met.");
          setIsAttemptingToAuth(false);
          return;
        }
        const registerResponse = await userRegister(username, email, password);
        if (!registerResponse.success) {
          toast.error(registerResponse.response.data.msg);
          setIsAttemptingToAuth(false);
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      toast.error("An unknown error occurred. Please try again");
      setIsAttemptingToAuth(false);
    }
  };

  useEffect(() => {
    // console.log(isPasswordCheckAllPass);
  }, [isPasswordCheckAllPass]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-6.5vh)]">
      <div className="bg-card rounded-lg shadow-md p-6 w-full md:max-w-md h-screen md:h-full">
        <h1 className="text-center text-2xl font-bold mb-2 text-copy-primary">Welcome to DropBoxer</h1>
        <p className="text-center text-copy-secondary mb-6">Login or create an account to get started</p>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`w-1/2 py-2 text-center font-semibold ${
              isLogin ? "border-b-2 border-background-opp text-copy-primary" : "text-copy-secondary"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 text-center font-semibold ${
              !isLogin ? "border-b-2 border-background-opp text-copy-primary" : "text-copy-secondary"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {!isLogin && (
          <div className="pb-4">
            <PasswordChecklistChecker
              rules={{ minLength: 8, capital: 1, specialChar: 1, number: 1, match: true }}
              password={password}
              repeatedPassword={confirmPassword}
              onChange={setIsPasswordCheckAllPass}
              isHideRuleOnSuccess={false}
              isCollapsable={true}
            />
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-copy-primary/80">Username</label>
              <input
                type="text"
                placeholder="Username"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
                autoComplete="username"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-copy-primary/80">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-copy-primary/80">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-copy-primary/80">Confirm Password</label>
              <input
                type="password"
                placeholder="Password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
                autoComplete="new-password"
              />
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center text-copy-primary/80">
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

          <button
            type="submit"
            disabled={isAttemptingToAuth}
            className={`w-full bg-cta text-cta-text py-2 rounded-md font-semibold ${
              !isAttemptingToAuth ? "hover:bg-cta-active" : ""
            } transition duration-500 ease-in-out`}
          >
            {isAttemptingToAuth ? (
              <>
                <Loader />
                {isLogin ? "Authenticating..." : "Registering..."}
              </>
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-center text-copy-secondary text-sm mt-4">
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
