import React, { useState, useEffect } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyPasswordResetToken, changeUserPassword } from "../api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import PasswordChecklistChecker from "../components/PasswordChecklistChecker";

function Landing_ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const navigate = useNavigate();
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isAttemptingToResetPassword, setIsAttemptingToResetPassword] = useState(false);
  const [isPasswordResetSuccessful, setIsPasswordResetSuccessful] = useState(false);
  const [isPasswordCheckAllPass, setIsPasswordCheckAllPass] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          setIsValidatingToken(true);
          const response = await verifyPasswordResetToken(token);
          if (response.success) {
            setIsTokenValid(true);
            // console.log("token is valid");
            setEmail(response.data.email);
          } else {
            toast.error("Invalid or expired token");
          }
        } catch (error) {
          // console.log(error);
          setIsTokenValid(false);
          // toast.error(error?.response?.data?.msg || "Failed to verify password reset token");
        } finally {
          setIsValidatingToken(false);
        }
      }
    };

    verifyToken();
  }, [token]);

  const handle_PasswordReset = async (event) => {
    event.preventDefault();

    if (!isPasswordCheckAllPass) {
      toast.error("Password requirements not met.");
      return;
    }

    if (!isTokenValid) {
      toast.error("Invalid token");
      return;
    }

    try {
      setIsAttemptingToResetPassword(true);
      const response = await changeUserPassword(email, password, token);
      if (response.success) {
        toast.success("Password has been changed");
        toast.info("Navigating to login page");
        setIsPasswordResetSuccessful(true);
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Failed to change password");
    } finally {
      setIsAttemptingToResetPassword(false);
    }
  };

  if (isValidatingToken) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <Loader />
          <p className="mt-5 text-copy-secondary">Validating Token...</p>
        </div>
      </Page_BoilerPlate>
    );
  }

  if (!isTokenValid) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <p className="text-red-500">Reset link has expired</p>
          <button
            className="w-full bg-cta hover:bg-cta-active text-cta-text font-semibold p-2 rounded mt-10 max-w-md transition duration-500 ease-in-out"
            onClick={() => navigate("/")}
          >
            Return to home page
          </button>
        </div>
      </Page_BoilerPlate>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-6.5vh)]">
      <div className="bg-card rounded-lg shadow-md p-6 w-full max-w-md">
        <form className="space-y-4" onSubmit={handle_PasswordReset}>
          <div className="flex flex-col">
            <p className="text-center text-2xl font-bold mb-2 text-copy-primary">Reset Password</p>
            <p className="text-center text-copy-secondary mb-6">Enter your new password to reset for {email}.</p>
          </div>

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

          <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-copy-primary/80">Password</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-copy-primary/80">Confirm Password</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            className={`w-full bg-cta text-cta-text py-2 rounded-md font-semibold ${
              !isAttemptingToResetPassword && !isPasswordResetSuccessful ? "hover:bg-cta-active" : ""
            } transition duration-500 ease-in-out`}
            type="submit"
            disabled={isAttemptingToResetPassword || isPasswordResetSuccessful}
          >
            {isAttemptingToResetPassword ? (
              <>
                <Loader />
                Resetting...
              </>
            ) : !isPasswordResetSuccessful ? (
              "Reset Password"
            ) : (
              "Password has been reset"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Landing_ResetPassword;
