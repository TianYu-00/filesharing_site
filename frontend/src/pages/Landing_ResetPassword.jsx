import React, { useState, useEffect } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyPasswordResetToken, changeUserPassword } from "../api";

function Landing_ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await verifyPasswordResetToken(token);
          if (response.success && response.data.isValid) {
            setIsTokenValid(true);
            console.log("token is valid");
            setEmail(response.data.email);
          } else {
            setMessage("Invalid or expired token.");
          }
        } catch (error) {
          setIsTokenValid(false);
          setMessage(error.response.data.msg);
        }
      }
    };

    verifyToken();
  }, [token]);

  const handle_PasswordReset = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!isTokenValid) {
      setMessage("Invalid token.");
      return;
    }

    try {
      const response = await changeUserPassword(email, password);
      if (response.success) {
        setMessage("Password has been changed");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage("Failed to change password");
      }
    } catch (error) {
      const tmpMessage = "failed";
      setMessage(tmpMessage);
    }
  };

  if (!isTokenValid) {
    return (
      <Page_BoilerPlate>
        <div className="flex flex-col justify-center items-center">
          <p className="text-red-500">{message}</p>
          <button
            className="w-full bg-black text-white font-semibold p-2 rounded mt-10 max-w-md"
            onClick={() => navigate("/")}
          >
            Return to home page
          </button>
        </div>
      </Page_BoilerPlate>
    );
  }

  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <form
          className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black"
          onSubmit={handle_PasswordReset}
        >
          <div className="flex flex-col">
            <p className="text-left font-bold text-3xl text-center">Reset Password</p>
            <p className="text-left mt-3 text-center">Enter your new password to reset for {email}.</p>
          </div>

          <div className="flex flex-col">
            <label className="text-left font-semibold">Password</label>
            <input
              className="border p-2 border-black rounded"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-left font-semibold">Confirm Password</label>
            <input
              className="border p-2 border-black rounded"
              type="password"
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className="flex flex-col">
              <p className={`text-${isTokenValid ? "green" : "red"}-500`}>{message}</p>
            </div>
          )}

          <button
            className="w-full border border bg-black text-white font-semibold p-2 rounded"
            type="submit"
            disabled={!isTokenValid}
          >
            Reset Password
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_ResetPassword;
