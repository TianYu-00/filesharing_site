import React, { useState, useEffect, useCallback } from "react";
import { sendPasswordResetLink } from "../api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

function Landing_ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isResetCoolDown, setIsResetCoolDown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [isAttemptingToSendEmail, setIsAttemptingToSendEmail] = useState(false);

  const startCooldownTimer = useCallback(() => {
    let timer;
    if (cooldownTimeLeft > 0) {
      timer = setTimeout(() => {
        setCooldownTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimeout(timer);
            setIsResetCoolDown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTimeLeft]);

  useEffect(() => {
    startCooldownTimer();
  }, [cooldownTimeLeft, startCooldownTimer]);

  const handle_ForgetPassword = async (event) => {
    event.preventDefault();
    if (isResetCoolDown) {
      toast.warn("Please wait before trying again.");
      return;
    }

    try {
      setIsAttemptingToSendEmail(true);
      const response = await sendPasswordResetLink(email);
      if (response.success) {
        toast.success(response.msg);
        setIsResetCoolDown(true);
        setCooldownTimeLeft(60);
      } else {
        toast.error(response.msg);
      }
    } catch (error) {
      const coolDown = error?.response?.data?.data?.coolDown;
      if (coolDown) {
        setIsResetCoolDown(true);
        setCooldownTimeLeft(coolDown);
        toast.error(error?.response?.data?.msg || "Too many requests, please try again later");
      } else {
        toast.error(error?.response?.data?.msg || "Failed to send password reset link");
      }
    } finally {
      setIsAttemptingToSendEmail(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-6.5vh)]">
      <div className="bg-card rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-2 text-copy-primary">Forgot Password</h1>
        <p className="text-center text-copy-secondary mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form className="space-y-4" onSubmit={handle_ForgetPassword}>
          <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-copy-primary/80">Email</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              type="email"
              placeholder="123456789@example.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className={`w-full bg-cta text-white py-2 rounded-md font-semibold transition duration-500 ease-in-out ${
              isResetCoolDown ? "bg-cta/40 cursor-not-allowed" : "hover:bg-cta-active"
            }`}
            type="submit"
            disabled={isResetCoolDown}
          >
            {isAttemptingToSendEmail ? (
              <>
                <Loader />
                Validating...
              </>
            ) : isResetCoolDown ? (
              `Please wait... (${cooldownTimeLeft}s)`
            ) : (
              "Request Password Reset"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Landing_ForgotPassword;
