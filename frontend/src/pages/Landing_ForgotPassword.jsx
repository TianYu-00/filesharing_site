import React, { useState } from "react";
import Page_BoilerPlate from "../components/Page_BoilerPlate";
import { sendPasswordResetLink } from "../api";

function Landing_ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handle_ForgetPassword = async (event) => {
    try {
      event.preventDefault();
      const response = await sendPasswordResetLink(email);
      console.log(response);
      if (response.success) {
        setMessage(response.msg);
      } else {
        setMessage(response.msg);
      }
    } catch (error) {
      setMessage(error.response.data.msg);
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
            <p className="text-left font-bold text-3xl text-center">Forgot password?</p>
            <p className="text-left mt-3 text-center">Enter your email to get a password reset link.</p>
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
            <p className="text-red-500">{message}</p>
          </div>

          <button className="w-full border border bg-black text-white font-semibold p-2 rounded" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </Page_BoilerPlate>
  );
}

export default Landing_ForgotPassword;

// Password reset flow

/*
- Enter their email
- Submit the form

*/
