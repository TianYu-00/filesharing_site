import React, { useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { sendPasswordResetLink } from "../api";
import { toast } from "react-toastify";

function Landing_ForgotPassword() {
  const [email, setEmail] = useState("");

  const handle_ForgetPassword = async (event) => {
    try {
      event.preventDefault();
      const response = await sendPasswordResetLink(email);
      // console.log(response);
      if (response.success) {
        toast.success(response.msg);
      } else {
        toast.error(response.msg);
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Failed to send password reset link");
    }
  };

  return (
    <Page_BoilerPlate>
      <div className="flex justify-center">
        <form
          className="border grid gap-4 p-4 w-full max-w-[500px] rounded-2xl bg-white text-black"
          onSubmit={handle_ForgetPassword}
        >
          <div className="flex flex-col">
            <p className="text-center text-2xl font-bold mb-2">Forgot password?</p>
            <p className="text-center text-gray-600 mb-6">Enter your email to get a password reset link.</p>
          </div>
          <div className="flex flex-col items-start">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border"
              type="email"
              placeholder="123456789@dropboxer.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full border border bg-blue-500 text-white font-semibold p-2 rounded hover:bg-blue-700 transition duration-500 ease-in-out"
            type="submit"
          >
            Reset Password
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_ForgotPassword;
